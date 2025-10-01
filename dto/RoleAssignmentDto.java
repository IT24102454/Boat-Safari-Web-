package com.boatsafari.managementsystem.dto;

import com.boatsafari.managementsystem.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for role assignment requests
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleAssignmentDto {
    private Long userId;
    private Role role;
}
