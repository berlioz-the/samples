package com.berlioz.samples;

import com.berlioz.Berlioz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        Berlioz.run();
        SpringApplication.run(Application.class, args);
    }

}