package com.taskmanager.taskmanager.repository;

import com.taskmanager.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndStatus(Long userId, Task.Status status);
    List<Task> findByUserIdAndPriority(Long userId, Task.Priority priority);
    List<Task> findByUserIdAndStatusAndPriority(Long userId, Task.Status status, Task.Priority priority);

    @Query("SELECT t FROM Task t WHERE t.userId = :userId " +
           "AND (:title IS NULL OR :title = '' OR LOWER(t.title) LIKE LOWER(:title)) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "ORDER BY t.positionOrder ASC")
    List<Task> searchTasks(
        @Param("userId") Long userId,
        @Param("title") String title,
        @Param("status") Task.Status status,
        @Param("priority") Task.Priority priority
    );

    @Query("SELECT MAX(t.positionOrder) FROM Task t WHERE t.userId = :userId")
    Double findMaxPositionByUserId(@Param("userId") Long userId);
}