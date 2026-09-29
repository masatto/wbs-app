package com.example.wbsapp;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WbsItemDependencyRepository extends JpaRepository<WbsItemDependency, Long> {
    List<WbsItemDependency> findByTaskId(Long taskId);
}
