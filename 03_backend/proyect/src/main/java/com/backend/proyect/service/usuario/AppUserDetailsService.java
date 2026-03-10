package com.backend.proyect.service.usuario;

import com.backend.proyect.model.usuario.Usuario;
import com.backend.proyect.repository.usuario.UsuarioRepository;
import com.backend.proyect.security.usuario.UsuarioPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String correoElectronico ) throws UsernameNotFoundException{
        Usuario existingUser = usuarioRepository.findByCorreoElectronico(correoElectronico)
                .orElseThrow(() -> new UsernameNotFoundException("Correo electrónico no encontrado:" + correoElectronico));
        return new UsuarioPrincipal(existingUser);

    }

}
