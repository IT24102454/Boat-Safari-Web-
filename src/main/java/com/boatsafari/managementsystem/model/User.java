// src/main/java/com/boatsafari/managementsystem/model/User.java
package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "second_name")
    private String secondName;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "contact_no")
    private String contactNo;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "street")
    private String street;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "hire_date")
    private String hireDate;

    @Column(name = "certification")
    private String certification;

    @Column(name = "status")
    private String status = "AVAILABLE"; // Default status

    // The role column is already in the database as a discriminator column
    @Column(name = "role", insertable = false, updatable = false)
    private String roleType;

    /**
     * Returns the role of the user
     *
     * @return The role as a string
     */
    public String getRole() {
        return roleType;
    }

    /**
     * Gets the role as an enum
     *
     * @return The Role enum value
     */
    public Role getRoleAsEnum() {
        if (roleType == null) return null;
        try {
            return Role.valueOf(roleType);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}