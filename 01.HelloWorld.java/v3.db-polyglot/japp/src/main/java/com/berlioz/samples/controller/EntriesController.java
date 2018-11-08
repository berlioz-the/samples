package com.berlioz.samples.controller;

import com.berlioz.samples.entity.Person;
import com.berlioz.samples.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EntriesController {

    @Autowired
    private PersonService service;

    @RequestMapping("/entries")
    public ResponseEntity<Object> entries() {

        List<Person> persons = service.getAllContacts();

        return new ResponseEntity<Object>(persons, HttpStatus.OK);
    }

}