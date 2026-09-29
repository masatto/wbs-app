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

    // 親タスクのid（ルートタスクはnull）。
    // JPAの@ManyToOneではなく、あえてただのLongにしている。
    // 理由：双方向関連にすると遅延ロードやJSON循環参照の問題が出るため、
    // 今は「ただの外部キー的な値」として扱う設計にした。
    // そのぶんDBレベルの整合性チェックは無いので、存在しないidを入れても
    // 保存は通ってしまう（フロント側の<select>で存在するタスクしか選べない
    // ようにして防いでいる）。
    private Long parentId;

    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private int progress;
    private int orderIndex;

}