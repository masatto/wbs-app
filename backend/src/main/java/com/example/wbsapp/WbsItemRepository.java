package com.example.wbsapp;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WbsItemRepository extends JpaRepository<WbsItem,Long>{
    // Spring Data JPAの「クエリメソッド」。
    // メソッド名（findBy + ParentId）だけでSQLを自動生成してくれるので、
    // 中身は1行も書かなくていい。カスケード削除で「子タスクを探す」ために使う。
    List<WbsItem> findByParentId(Long parentId);
}