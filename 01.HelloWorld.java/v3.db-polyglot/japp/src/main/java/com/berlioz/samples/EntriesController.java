package com.berlioz.samples;

import com.berlioz.Berlioz;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;

@RestController
public class EntriesController {

    @RequestMapping("/entries")
    public ResponseEntity<Object> entries() throws Exception {
        Connection con = Berlioz.service("db").mysql()
                .getConnection("jdbc:mysql://x/" + System.getenv("HELLO_RELATIONAL_DB_NAME") + "?useSSL=false",
                        System.getenv("HELLO_RELATIONAL_DB_USER"),
                        System.getenv("HELLO_RELATIONAL_DB_PASS"));

        Statement statement = con.createStatement();
        ResultSet resultSet = statement.executeQuery("SELECT * FROM addressBook");

        ArrayList<Person> persons = new ArrayList<Person>();
        while(resultSet.next()) {
            Person person = new Person();
            person.name = resultSet.getString("name");
            person.phone = resultSet.getString("phone");
            persons.add(person);
        }
        return new ResponseEntity<Object>(persons, HttpStatus.OK);
    }

}