package com.boatsafari.managementsystem.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;

@Component
public class DbConnectionTest implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=================== DATABASE CONNECTION TEST ===================");
        try {
            Connection connection = dataSource.getConnection();
            DatabaseMetaData metaData = connection.getMetaData();

            System.out.println("Connection successful!");
            System.out.println("Database Product Name: " + metaData.getDatabaseProductName());
            System.out.println("Database Product Version: " + metaData.getDatabaseProductVersion());
            System.out.println("Database Driver Name: " + metaData.getDriverName());
            System.out.println("Database Driver Version: " + metaData.getDriverVersion());

            // Test query
            try {
                Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                System.out.println("Test query executed successfully with result: " + result);
            } catch (Exception e) {
                System.out.println("Test query failed: " + e.getMessage());
            }

            connection.close();
        } catch (SQLException e) {
            System.out.println("Database connection failed: " + e.getMessage());
            e.printStackTrace();
        }
        System.out.println("===============================================================");
    }
}
