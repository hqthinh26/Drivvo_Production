'use strict'

//ALTER DATABASE company SET timezone TO 'Asia/Ho_Chi_Minh';

module.exports = {
  up: async function(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      
      ALTER DATABASE d71babp6b76q45 SET timezone TO 'Asia/Ho_Chi_Minh';

      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE users(
        u_id uuid PRIMARY KEY,
        u_fullname text NOT NULL,
        u_phone text NOT NULL,
        u_email text NOT NULL UNIQUE,
        u_pw text,
        u_gg bool
    );


      create table userRefreshTokenExt(
        ID bigserial primary key,
        refreshToken text,
        rdt timestamp default now(),
        created_at timestamp default now(),
        updated_at timestamp
      );

      CREATE TABLE loainhienlieu(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );

      CREATE TABLE tramxang(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );

      CREATE TABLE diadiem(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );

      CREATE TABLE loaidichvu(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );

      CREATE TABLE loaichiphi(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );

      CREATE TABLE loaithunhap(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );

      CREATE TABLE lydo(
        ID serial8 PRIMARY KEY,
        usr_id uuid NOT NULL,
        name text NOT NULL,
        created_at timestamptz default now(),
        FOREIGN KEY (usr_id) REFERENCES users (u_id)
      );
      
    `, {raw: true}) 
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      
      

      
    `, {raw: true}) 
  }
}