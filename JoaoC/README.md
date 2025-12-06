<div align="center">
  <h1>📋 FasiComercio - Sistema de Ordem de Compra</h1>
  <p>
    <strong>API RESTful para gerenciamento de ordens de compra, construída com Java e Spring Boot.</strong>
  </p>
  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-contribuição">Contribuição</a>
  </p>

  ![Java](https://img.shields.io/badge/Java-JDK_24-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
  ![Spring](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
  ![Maven](https://img.shields.io/badge/Maven-4.0.0-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
</div>

---

## 🎯 Sobre o Projeto

O **FasiComercio - Sistema de Ordem de Compra** é uma aplicação backend desenvolvida em Java com Spring Boot para gerenciar todo o fluxo de ordens de compra de forma centralizada e eficiente. O sistema permite a aprovação de orçamentos.

Este projeto foi desenvolvido seguindo as melhores práticas de APIs REST, garantindo uma comunicação padronizada, segura e eficiente.

---

## ✨ Funcionalidades

- ✅ Aprovação de orçamentos por usuários/grupos
- ✅ Interface web para consulta e aprovação de pedidos
- ✅ API RESTful para integração com sistemas externos

---

## 🚀 Tecnologias

As seguintes ferramentas e tecnologias foram utilizadas na construção do projeto:

- **Java 24** - Linguagem de programação
- **Spring Boot 3.3.0** - Framework web e backend
- **Maven 4.0.0** - Gerenciador de dependências
- **MySQL 8.0** - Banco de dados relacional
- **Thymeleaf** - Processamento de templates HTML
- **HTML/CSS/JavaScript** - Interface web frontend

---

## 🛠️ Como Executar

Siga os passos abaixo para configurar e executar o projeto localmente.

### **Pré-requisitos**

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Java JDK 24](https://www.oracle.com/br/java/technologies/downloads/)
- [Apache Maven](https://maven.apache.org/download.cgi)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [Git](https://git-scm.com/downloads)

### **Passo a Passo**

1. **Clone o repositório da branch correta:**
   ```bash
   git clone https://github.com/maenza455/FasiComercio.git
   cd FasiComercio
   git checkout feature/joao-controle-pedido
   cd JoaoC
   ```

2. **Configure o Banco de Dados:**
   - Crie um banco de dados chamado `fasicomercio` em seu MySQL
   - As tabelas serão criadas automaticamente pelo Spring Boot (JPA)

3. **Configure a Conexão com o Banco:**
   - Localize o arquivo `src/main/resources/application.properties`
   - Ajuste as propriedades do `spring.datasource` com suas credenciais do MySQL:
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/fasicomercio
     spring.datasource.username=SEU_USUARIO_MYSQL
     spring.datasource.password=SUA_SENHA_MYSQL
     spring.jpa.hibernate.ddl-auto=update
     ```

4. **Execute a aplicação:**
   - Utilize o Maven para compilar e iniciar o servidor Spring Boot:
     ```bash
     mvn spring-boot:run
     ```
   - A aplicação estará disponível em `http://localhost:8080`
   - Acesse a interface web para gerenciar ordens de compra

---

## 📁 Estrutura do Projeto

```
src/
├── main/
│   ├── java/com/br/fasipe/compras/
│   │   ├── controller/         # Controladores REST
│   │   ├── service/            # Lógica de negócio
│   │   ├── model/              # Entidades JPA
│   │   ├── repository/         # Acesso a dados
│   │   ├── dto/                # Data Transfer Objects
│   │   └── config/             # Configurações da aplicação
│   └── resources/
│       ├── static/             # Arquivos CSS, JS, imagens
│       ├── templates/          # Templates HTML (Thymeleaf)
│       └── application.properties
└── test/
    └── java/                   # Testes unitários
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Se você deseja contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona minha feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido por: João Carlos Almeida - Projeto de Controle de Ordens de Compra (Branch: feature/joao-controle-pedido)
