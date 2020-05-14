## Development

1. Sửa biến môi trường
Tìm file client.env và server.env ở các thư mục client và server tương ứng để

2. Build db trước
**$ docker-compose up --build db**
Những lần sau chạy bỏ --build đi

3. Chạy server lên
**$ docker-compose up --build server**
Quá trình chạy sẽ luôn chạy migration, tuy nhiên do chặn ở db nên ko bao giờ duplicate
Những lần sau chạy bỏ --build đi

4. Nếu là lần đầu cần chạy seeding, những lần sau không cần
+ docker-compose exec server /bin/bash
+ sequelize db:seed:all

5. Chạy client lên
**$ docker-compose up --build client **
Những lần sau chạy bỏ --build đi

Khi dev, các thay đổi ở server lẫn client đều sẽ được cập nhật liên tục.

======================================================================================



## Triển khai 
1. Chạy container db và server
   **$ docker-compose up**
   Chú ý lúc này chỉ có db là up, server cũng vẫn up nhưng node.js chưa chạy
2. Chạy migration để tạo cấu trúc CSDL (chỉ chạy lần đầu)
   **$ docker-compose run --rm server npm run sequelize db:migrate**
3. Tạo ra dữ liệu ban đầu (chỉ chạy lần đầu)
   **$ docker-compose run --rm server npm run sequelize db:seed:all**
4. Chạy server lên
   **$ nohup docker-compose run --rm --service-ports server npm start & disown**
   Nếu thấy 
    *nohup: ignoring input and appending output to 'nohup.out'*
   là đúng
   + nohup là viết tắt của no hang up , tức khi tắt cha sẽ không gởi tín hiệu tắt các process con
   + & sẽ chặn input lại và đẩy output ra chỗ khác
   + disown: terminal sẽ từ bỏ quyền làm cha với process vừa chạy
5. Cần coi lại log của server thì 
   **$ cat nohup.out**
6. Muốn stop server thì
   **$ docker-compose stop server** 
7. Kiểm tra api bằng cách truy cập đường link trong trình duyệt
[http://localhost:3001/graphiql](http://localhost:3001/graphiql)

8. Chạy client lên
   **$ nohup docker-compose up client & disown**
9. Cần coi lại log của client thì 
   **$ cat nohup.out**
10. Muốn stop server thì
   **$ docker-compose stop client** 
## Nếu phát triển server

1. Chạy container db lên
   **$ docker-compose up db**  

2. Chạy migration để tạo ra cấu trúc CSDL (chỉ chạy lần đầu) 
   **$ cd server**  

   **$ sequelize db:migrate** (chỉ chạy lần đầu)

3. Tạo ra dữ liệu ban đầu
   **$ sequelize db:seed:all**

4. Chạy server với cấu hình dành cho dev
   **$ npm run dev**
Nếu không muốn mỗi khi có thay đổi phải tắt và mở server thì có thể dùng nodemon
5. Kiểm tra api bằng cách truy cập đường link trong trình duyệt
[http://localhost:3001](http://localhost:3001)

## Nếu phát triển client

1. Chạy container db và server
   **$ docker-compose up**
   Chú ý lúc này chỉ có db là up, server cũng vẫn up nhưng node.js chưa chạy
2. Chạy migration để tạo cấu trúc CSDL (chỉ chạy lần đầu)
   **$ docker-compose run --rm server npm run sequelize db:migrate**
3. Tạo ra dữ liệu ban đầu (chỉ chạy lần đầu)
   **$ docker-compose run --rm server npm run sequelize db:seed:all**
4. Chạy server lên
   **$ docker-compose run --rm --service-ports server npm start**
   Nếu thấy 
    *Server is listening at port 3001*
   là đúng
5. Kiểm tra api bằng cách truy cập đường link trong trình duyệt
[http://localhost:3001](http://localhost:3001)


## Nếu muốn tự tạo mới một bảng (chức năng mới)

1. Tạo cấu trúc bảng  
   **$ sequelize model:generate --name demo --attributes name:string,count:integer** 
2. Mở file migration để hiệu chỉnh thêm  
   + Tự chèn thời gian hiện tại  
   _createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()')}_  
   + Cho quyền select, insert, delete, update cho một bảng  
   _grant select, insert, delete, update on public.mynewtable to manager_  
   Mặc định admin có toàn bộ quyền cho các bảng  
   + Cho quyền execute một hàm  
   _grant execute on function authenticate(text, text) to manager_  
3. Chạy migration  
   **$ sequelize db:migrate**  
4. Nếu muốn tạo file seeding:
   **$sequelize seed:generate --name demo-data**
4. Nếu muốn tạo csdl mẫu (seeding)  
   **$ sequelize db:seed:all**  
5. Mở file seeding để hiệu chỉnh   
