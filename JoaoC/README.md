<div align="center">
  <img src="https://github.com/user-attachments/assets/20a36d8d-228f-410b-a4b8-992b18d334db" alt="" width="450"/>
  <h1>📦 Fasiclin Estoque</h1>
  <p>
    <strong>API RESTful para o sistema de gerenciamento de estoque "Fasiclin", construída com Java e Spring Boot.</strong>
  </p>
  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-roadmap-de-funcionalidades">Roadmap</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-contribuidores">Contribuidores</a>
  </p>

  ![Java](https://img.shields.io/badge/Java-JDK_24-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
  ![Spring](https://img.shields.io/badge/Spring_Boot-3.3.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
  ![Maven](https://img.shields.io/badge/Maven-4.0.0-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

  <p>
    <img src="https://img.shields.io/github/actions/workflow/status/matheusassuncaoo/fasiclin-estoque/main.yml?style=for-the-badge&branch=main" alt="Build Status">
    <img src="https://img.shields.io/github/license/matheusassuncaoo/fasiclin-estoque?style=for-the-badge" alt="Licença">
    <img src="https://img.shields.io/github/last-commit/matheusassuncaoo/fasiclin-estoque?style=for-the-badge" alt="Último Commit">
  </p>
</div>

## 🎯 Sobre o Projeto

A **API Fasiclin Estoque** é o backend de um sistema para controle de inventário. A aplicação permite o gerenciamento completo de produtos, fornecedores, entradas e saídas, fornecendo uma base sólida e escalável para qualquer sistema de frontend (web ou mobile) que precise consumir esses dados.

Este projeto acadêmico foi desenvolvido seguindo as melhores práticas de APIs REST, garantindo uma comunicação padronizada, segura e eficiente.

---

## 🗺️ Roadmap de Funcionalidades

Este é o planejamento de entregas do projeto. Conforme as funcionalidades forem implementadas, os itens serão marcados.

-   [ ] **Módulo de Produtos:** CRUD completo (Create, Read, Update, Delete).
-   [ ] **Módulo de Fornecedores:** CRUD completo.
-   [ ] **Módulo de Categorias:** CRUD completo e associação com produtos.
-   [ ] **Controle de Movimentação:** Endpoints para registrar entradas e saídas de estoque.
-   [ ] **Validações:** Implementar Bean Validation nas entidades e DTOs.
-   [ ] **Tratamento de Exceções:** Criar handlers para exceções de negócio e de sistema.
-   [ ] **Segurança:** Implementar autenticação e autorização com Spring Security e JWT.
-   [ ] **Relatórios:** Endpoints para gerar relatórios básicos de estoque.
-   [ ] **Documentação:** Gerar documentação da API com Swagger/OpenAPI.

---

## 🚀 Tecnologias

As seguintes ferramentas e tecnologias foram utilizadas na construção do projeto:

<div align="center" style="display: flex; justify-content: center; gap: 15px;">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java"/>
  <img src="https://img.shields.io/badge/Spring-6DB33F?style=for-the-badge&logo=spring&logoColor=white" alt="Spring"/>
  <img src="https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white" alt="Maven"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"/>
  <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Postman"/>
  <img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VSCode"/>
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git"/>
</div>

---

## 🛠️ Como Executar

Siga os passos abaixo para configurar e executar o projeto localmente.

### **Pré-requisitos**

Antes de começar, você vai precisar ter instalado em sua máquina:
-   [Java JDK 24](https://www.oracle.com/br/java/technologies/downloads/)
-   [Apache Maven](https://maven.apache.org/download.cgi)
-   [MySQL Server](https://dev.mysql.com/downloads/mysql/)
-   [Git](https://git-scm.com/downloads)
-   Um cliente de API, como o [Postman](https://www.postman.com/downloads/).

### **Passo a Passo**

1.  **Clone o repositório da API:**
    ```bash
    git clone [https://github.com/matheusassuncaoo/fasiclin-estoque.git](https://github.com/matheusassuncaoo/fasiclin-estoque.git)
    cd fasiclin-estoque
    ```

2.  **Configure o Banco de Dados:**
    - O script para criação do banco de dados e tabelas está no repositório [fasiclindb_mysql](https://github.com/paulo-amadeu97/fasiclindb_mysql).
    - Clone o repositório do banco de dados:
      ```bash
      git clone [https://github.com/paulo-amadeu97/fasiclindb_mysql.git](https://github.com/paulo-amadeu97/fasiclindb_mysql.git)
      ```
    - Importe e execute o arquivo `.sql` no seu servidor MySQL. Ele criará o banco de dados `fasiclin_db`.

3.  **Configure a Conexão com o Banco:**
    - No seu projeto, localize o arquivo `src/main/resources/application.properties`.
    - Altere as propriedades do `spring.datasource` com as suas credenciais do MySQL:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/fasiclin_db
    spring.datasource.username=SEU_USUARIO_MYSQL
    spring.datasource.password=SUA_SENHA_MYSQL
    ```

4.  **Execute a aplicação:**
    - Utilize o Maven para compilar e iniciar o servidor Spring Boot:
    ```bash
    mvn spring-boot:run
    ```
    - A API estará disponível em `http://localhost:8080`.

---

## ✨ Contribuidores


