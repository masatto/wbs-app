package com.example.wbsapp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

// 「先行タスク」を表す1行。taskIdはpredecessorIdの後に開始する、という
// 意味の関連を持つだけで、日付の自動調整などのロジックは今は持たせない
// （情報として記録するだけ）。
// parentIdと同様、JPAの関連オブジェクトではなくただのLongで持つ。
// taskIdをフィールドにするのではなく別テーブルにしたのは、1タスクが
// 複数の先行タスクを持てるようにするため（parentIdの1対1の制約を
// 踏襲しない）。
@Getter
@Setter
@Entity
public class WbsItemDependency {
    @Id
    @GeneratedValue
    private Long id;

    private Long taskId;
    private Long predecessorId;
}
