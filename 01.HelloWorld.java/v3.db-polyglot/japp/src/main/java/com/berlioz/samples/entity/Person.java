package com.berlioz.samples.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "addressBook")
public class Person {

    @Id
    @Column(name = "name")
    public String name;

    @Column(name = "phone")
    public String phone;
}
