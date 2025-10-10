// src/main/java/com/boatsafari/managementsystem/model/User.java
package com.boatsafari.managementsystem.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Table(name = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userId")
    private Long userId;

    @Column(name = "firstName")
    private String firstName;

    @Column(name = "secondName")
    private String secondName;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "contactNo")
    private String contactNo;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "street")
    private String street;

    @Column(name = "postalCode")
    private String postalCode;

    @Column(name = "hireDate")
    private String hireDate;

    @Column(name = "certification")
    private String certification;

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