import { Inject, Service } from "typedi";
import { IAdminDataParams, IGetAllUsersParams, IUpdateUserRoleParams } from "../../Domain/types/admin.types";
import { IUserRepository, IUserRepositoryToken } from "../../Domain/repositories/IUserRepository";
import appAssert from "../../Shared/utils/appAssert";
import { BAD_REQUEST, CONFLICT, FORBIDDEN, NOT_FOUND, } from "../../Shared/constants/http";
import { ERROR_MESSAGES } from "../../Shared/constants/messages";
import generateUserId from "../../Infrastructure/Database/repositories/CounterSchema";
import Role from "../../Shared/constants/roles";
import { UserDocument } from "../../Infrastructure/Database/Models/user.model";
import { Invoice, InvoiceInput, InvoiceQueryParams, UpdateInvoiceParams } from "../../Domain/types/invoice.types";
import { deriveFinancialYear } from "../../Shared/utils/getFinancialYear";
import { IInvoiceRepository, IInvoiceRepositoryToken } from "../../Domain/repositories/IInvoiceRepository";
import { IInvoice } from "../../Infrastructure/Database/Models/invoice.model";
import { Types } from "mongoose";

@Service()
export class AdminUseCase {
    constructor(
        @Inject(IUserRepositoryToken) private __userRepository: IUserRepository,
        @Inject(IInvoiceRepositoryToken) private __invoiceRepository: IInvoiceRepository
    ) { }

    async createAdminService(usersData: IAdminDataParams, userId: string): Promise<any> {

        const isUser = await this.__userRepository.findUserByEmail(usersData.email);
        appAssert(!isUser, CONFLICT, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
        appAssert(usersData.role === Role.UNIT_MANAGER, CONFLICT, ERROR_MESSAGES.CAN_ONLY_CREATE_UNIT_MANAGERS);

        const generatedId = await generateUserId(usersData.role as Role);
        const user = await this.__userRepository.createUser({
            _id: generatedId,
            name: usersData.name,
            email: usersData.email,
            password: usersData.password,
            role: usersData.role,
            group: usersData.group,
            createdBy: userId
        });
        appAssert(user, CONFLICT, ERROR_MESSAGES.USER_CREATION_FAILED);
        console.log(user)
        return {
            user: user.omitPassword(),
        }
    }
    async getAllUsersService(user: UserDocument, filter: IGetAllUsersParams): Promise<any> {
        const response = await this.__userRepository.getAllUsersForAdmin(user, filter);
        return { users: response }
    }


    async updateUserRoleService({
        targetUserId,
        role: newRole,
        userId: actingUserId,
        role: actingUserRole
    }: IUpdateUserRoleParams & { role: Role }): Promise<any> {
        const targetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(targetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(newRole !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE);
        let authorized = false;
        if (actingUserRole === Role.SUPER_ADMIN) {
            authorized = true;
        } else if (actingUserRole === Role.ADMIN) {
            const unitManagers = await this.__userRepository.findUsersByCreatorId(actingUserId);
            const unitManagerIds = unitManagers.map((u) => u._id.toString());

            if (unitManagerIds.includes(targetUserId)) {
                authorized = true;
            } else {
                const users = await this.__userRepository.findUsersByMultipleCreatorIds(unitManagerIds);
                const userIds = users.map((u) => u._id.toString());
                if (userIds.includes(targetUserId)) {
                    authorized = true;
                }
            }
        } else if (actingUserRole === Role.UNIT_MANAGER) {
            const users = await this.__userRepository.findUsersByCreatorId(actingUserId);
            const userIds = users.map((u) => u._id.toString());
            if (userIds.includes(targetUserId)) {
                authorized = true;
            }
        }
        appAssert(authorized, FORBIDDEN, ERROR_MESSAGES.USER_NOT_CREATED_BY_YOU);
        appAssert(targetUser.role !== newRole, CONFLICT, `This user already has the role ${newRole}`);
        const updatedUser = await this.__userRepository.updateUserRole(targetUserId, newRole);
        return {
            updatedUser: updatedUser!.omitPassword(),
        };
    }


    async deleteUserService(
        targetUserId: string,
        actingUserId: string,
        actingUserRole: Role
    ): Promise<any> {
        const targetUser = await this.__userRepository.findUserById(targetUserId);
        appAssert(targetUser, CONFLICT, ERROR_MESSAGES.USER_NOT_FOUND);
        appAssert(targetUser.role !== Role.SUPER_ADMIN, CONFLICT, ERROR_MESSAGES.NOT_AUTHORIZED);

        let authorized = false;

        if (actingUserRole === Role.SUPER_ADMIN) {
            authorized = true;
        } else if (actingUserRole === Role.ADMIN) {
            const unitManagers = await this.__userRepository.findUsersByCreatorId(actingUserId);
            const unitManagerIds = unitManagers.map((u) => u._id.toString());

            if (unitManagerIds.includes(targetUserId)) {
                authorized = true;
            } else {
                const users = await this.__userRepository.findUsersByMultipleCreatorIds(unitManagerIds);
                const userIds = users.map((u) => u._id.toString());
                if (userIds.includes(targetUserId)) {
                    authorized = true;
                }
            }
        } else if (actingUserRole === Role.UNIT_MANAGER) {
            const users = await this.__userRepository.findUsersByCreatorId(actingUserId);
            const userIds = users.map((u) => u._id.toString());
            if (userIds.includes(targetUserId)) {
                authorized = true;
            }
        }

        appAssert(authorized, FORBIDDEN, ERROR_MESSAGES.NOT_AUTHORIZED);

        await this.__userRepository.deleteUserById(targetUserId);
    }


    async createInvoiceService(invoice: InvoiceInput, creatorId: string, role: string): Promise<any> {
        const invoiceDate = new Date(invoice.invoiceDate);
        const financialYear = deriveFinancialYear(invoiceDate);
        const existingInvoice = await this.__invoiceRepository.findByInvoiceNumberAndFY(
            invoice.invoiceNumber,
            financialYear
        );
        appAssert(!existingInvoice, CONFLICT, ERROR_MESSAGES.INVOICE_NUMBER_EXISTS);

        const allInvoices = await this.__invoiceRepository.findInvoicesByFYSorted(financialYear);
        const currentNumber = parseInt(invoice.invoiceNumber);
        const prevInvoice = allInvoices.find(inv => parseInt(inv.invoiceNumber) === currentNumber - 1);
        const nextInvoice = allInvoices.find(inv => parseInt(inv.invoiceNumber) === currentNumber + 1);

        appAssert(
            !prevInvoice || invoiceDate > new Date(prevInvoice.invoiceDate),
            BAD_REQUEST,
            `Invoice date must be after invoice ${prevInvoice?.invoiceNumber}`
        );
        appAssert(
            !nextInvoice || invoiceDate < new Date(nextInvoice.invoiceDate),
            BAD_REQUEST,
            `Invoice date must be before invoice ${nextInvoice?.invoiceNumber}`
        );
        const invoicePayload = {
            ...invoice,
            invoiceDate,
            financialYear,
            createdBy: creatorId,
            createdByRole: role as Role,
        };
        const created = await this.__invoiceRepository.createInvoice(invoicePayload);
        return created;
    }



    async updateInvoiceService(
        invoice: Partial<UpdateInvoiceParams>,
        userId: string,
        role: string
    ): Promise<IInvoice> {
        console.log(invoice)
        const invoiceId = new Types.ObjectId(invoice._id!);
        const existingInvoice = await this.__invoiceRepository.findInvoiceById(invoiceId!);
        appAssert(existingInvoice, NOT_FOUND, ERROR_MESSAGES.INVOICE_NOT_FOUND);

        const invoiceCreatorId = existingInvoice.createdBy;
        let authorized = false;

        if (invoiceCreatorId === userId) {
            authorized = true;
        } else if (role === Role.ADMIN) {
            const unitManagers = await this.__userRepository.findUsersByCreatorId(userId);
            const unitManagerIds = unitManagers.map((um) => um._id.toString());

            if (unitManagerIds.includes(invoiceCreatorId)) {
                authorized = true;
            } else {

                const users = await this.__userRepository.findUsersByMultipleCreatorIds(unitManagerIds);
                const userIds = users.map((u) => u._id.toString());
                if (userIds.includes(invoiceCreatorId)) {
                    authorized = true;
                }
            }
        } else if (role === Role.UNIT_MANAGER) {
            const users = await this.__userRepository.findUsersByCreatorId(userId);
            const userIds = users.map((u) => u._id.toString());
            if (userIds.includes(invoiceCreatorId)) {
                authorized = true;
            }
        }

        appAssert(authorized, FORBIDDEN, ERROR_MESSAGES.NOT_AUTHORIZED);

        const { invoiceNumber, invoiceDate, invoiceAmount, type, description } = invoice;
        const updated = await this.__invoiceRepository.updateInvoice(
            existingInvoice._id as Types.ObjectId,
            {
                invoiceNumber,
                invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
                invoiceAmount,
                type,
                description,
            }
        );


        return updated!;
    }

    async deleteInvoiceService(invoiceId: string, userId: string, role: string): Promise<void> {
        const invoiceIdObj = new Types.ObjectId(invoiceId);
        const existingInvoice = await this.__invoiceRepository.findInvoiceById(invoiceIdObj);
        appAssert(existingInvoice, NOT_FOUND, ERROR_MESSAGES.INVOICE_NOT_FOUND);

        const invoiceCreatorId = existingInvoice.createdBy;
        let authorized = false;

        if (role === Role.SUPER_ADMIN) {
            authorized = true;
        } else if (invoiceCreatorId === userId) {
            authorized = true;
        } else if (role === Role.ADMIN) {

            const unitManagers = await this.__userRepository.findUsersByCreatorId(userId);
            const unitManagerIds = unitManagers.map((um) => um._id.toString());

            if (unitManagerIds.includes(invoiceCreatorId)) {
                authorized = true;
            } else {

                const users = await this.__userRepository.findUsersByMultipleCreatorIds(unitManagerIds);
                const userIds = users.map((u) => u._id.toString());
                if (userIds.includes(invoiceCreatorId)) {
                    authorized = true;
                }
            }
        } else if (role === Role.UNIT_MANAGER) {
            const users = await this.__userRepository.findUsersByCreatorId(userId);
            const userIds = users.map((u) => u._id.toString());
            if (userIds.includes(invoiceCreatorId)) {
                authorized = true;
            }
        }

        appAssert(authorized, FORBIDDEN, ERROR_MESSAGES.NOT_AUTHORIZED);

        await this.__invoiceRepository.deleteInvoiceById(invoiceIdObj);
    }


    private async getHierarchyUserIds(user: UserDocument): Promise<string[]> {
        const role = user.role;
        const userId = user._id.toString();

        if (role === Role.SUPER_ADMIN) {
            const allUsers = await this.__userRepository.findAllUsers();
            return allUsers.map(u => u._id.toString());
        }

        if (role === Role.ADMIN) {
            const unitManagers = await this.__userRepository.findUsersByCreatorId(userId);
            const unitManagerIds = unitManagers.map(um => um._id.toString());

            const users = await this.__userRepository.findUsersByMultipleCreatorIds(unitManagerIds);
            const userIds = users.map(u => u._id.toString());

            return [userId, ...unitManagerIds, ...userIds];
        }

        if (role === Role.UNIT_MANAGER) {
            const users = await this.__userRepository.findUsersByCreatorId(userId);
            const userIds = users.map(u => u._id.toString());

            return [userId, ...userIds];
        }
        return [userId];
    }
    async getUserHierarchyInvoices(
        userDetails: UserDocument,
        filterOptions: InvoiceQueryParams
    ): Promise<any> {
        const hierarchyIds = await this.getHierarchyUserIds(userDetails);
        return await this.__invoiceRepository.findAllInvoicesForUsers(hierarchyIds, filterOptions);
    }




}
