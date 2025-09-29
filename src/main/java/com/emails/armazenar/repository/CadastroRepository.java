package com.emails.armazenar.repository;

import com.emails.armazenar.model.Cadastro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CadastroRepository extends JpaRepository<Cadastro, Long> {
    Optional<Cadastro> findByLogin(String email);

}
