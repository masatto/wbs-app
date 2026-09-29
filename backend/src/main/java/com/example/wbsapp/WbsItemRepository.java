package com.example.wbsapp;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WbsItemRepository extends JpaRepository<WbsItem,Long>{ 
    List<WbsItem> findByParentId(Long parentId);
}