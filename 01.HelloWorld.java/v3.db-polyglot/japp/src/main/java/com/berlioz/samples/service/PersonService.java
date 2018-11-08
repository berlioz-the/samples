package com.berlioz.samples.service;

import com.berlioz.samples.entity.Person;
import com.berlioz.samples.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonService {

    @Autowired
    private PersonRepository repository;

    public List<Person> getAllContacts()
    {
        return repository.findAll();
    }
}
