package com.emails.armazenar.service;

import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.model.Emails;
import com.emails.armazenar.repository.CadastroRepository;
import com.emails.armazenar.repository.EmailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LoginService {

    private final CadastroRepository repository;
    private final EmailsRepository repositoryEmails;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public LoginService(CadastroRepository repository,
                        EmailsRepository repositoryEmails,
                        PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.repositoryEmails = repositoryEmails;
        this.passwordEncoder = passwordEncoder;
    }

    // autenticação
    public Cadastro authenticate(String login, String rawPassword) {
        Optional<Cadastro> optionalUsuario = repository.findByLogin(login);
        if (optionalUsuario.isEmpty()) return null;

        Cadastro usuario = optionalUsuario.get();
        boolean valid = passwordEncoder.matches(rawPassword, usuario.getSenha());
        return valid ? usuario : null;
    }

    public Cadastro findByLogin(String login) {
        return repository.findByLogin(login).orElse(null);
    }

    public List<Emails> getEmailsDoUsuario(Cadastro usuario) {
        return repositoryEmails.findByUsuario(usuario);
    }

    public List<Emails> getEmailsPorLogin(String login) {
        Cadastro usuario = findByLogin(login);
        if (usuario == null) return List.of();
        return repositoryEmails.findByUsuario(usuario);
    }

    //salvar email vinculando ao destinatário
    public Emails salvarEmail(Emails email) {
        // verifica se o destinatário existe no cadastro
        Cadastro destinatario = repository.findByLogin(email.getDestinatario())
                .orElse(null);

        if (destinatario == null) {
            throw new RuntimeException("Destinatário não encontrado");
        }

        // define a data caso não venha preenchida
        if (email.getDataRecebida() == null) {
            email.setDataRecebida(LocalDateTime.now());
        }

        return repositoryEmails.save(email);
    }

    public Emails atualizarStatusEmail(Long id, String novoStatus) {
        Optional<Emails> emailOpt = repositoryEmails.findById(id);
        if (emailOpt.isEmpty()) {
            return null;
        }

        Emails email = emailOpt.get();
        email.setStatus(novoStatus);
        return repositoryEmails.save(email);
    }


}
