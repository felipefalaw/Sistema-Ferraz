package com.emails.armazenar;

import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.repository.CadastroRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class SecurityService implements UserDetailsService {

    private final CadastroRepository repository;
    private final PasswordEncoder passwordEncoder;

    public SecurityService(CadastroRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Cadastro usuario = repository.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        return User.builder()
                .username(usuario.getLogin())
                .password(usuario.getSenha())
                .roles("USER")
                .build();
    }

    public Cadastro salvarUsuario(Cadastro usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return repository.save(usuario);
    }
}
