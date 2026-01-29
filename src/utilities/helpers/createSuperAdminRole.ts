import { RoleDAL } from "../../dals/User";
import { AccessType } from "../constants/Constants";
import superAdminAccessRules from "../constants/SuperAdminAccessRules";

/**
 * Creates a new role with all Super Admin permissions
 * @param name The name of the new role
 * @param description Optional description for the role
 * @returns Promise with the created role
 */
export const createSuperAdminRole = async (name: string, description?: string) => {
  return await RoleDAL.create({
    name,
    description: description || `Role with Super Admin permissions: ${name}`,
    access_rules: superAdminAccessRules,
    type: AccessType.SUPER_ADMIN
  });
};

export default createSuperAdminRole;