package com.example.wbsapp;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter 
@Entity 
public class WbsItem{
    @Id 
    @GeneratedValue 
    private Long id;
    private Long parentId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private int progress;
    private int orderIndex;

}