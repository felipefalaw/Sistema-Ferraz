package com.emails.armazenar.repository;

import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.model.Emails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailsRepository extends JpaRepository<Emails, Long> {
    List<Emails> findByDestinatarioAndStatus(String destinatario, String status);
    List<Emails> findByUsuario(Cadastro usuario);

}
