FROM node:10 
WORKDIR /usr/app
COPY package.json yarn.lock ./ 
RUN yarn install
COPY ./ .
RUN yarn global add sequelize sequelize-cli pg nodemon


#-----NEW CMD Final: Hoat dong nhu 1 terminal binh thuong
#CMD "yarn run start" => not ok
#CMD yarn run start => ok
#CMD bash -c "yarn run start" => ok

#CMD ["/bin/bash", "-c", "yarn run start"] => ok
#CMD ["/bin/sh", "-c", "yarn run start"] => ok
#CMD ["/bin/sh", "yarn run start"] => not ok

#CMD ["bash", "-c", "yarn run start"] => OK
#CMD ["sh", "-c", "yarn run start"] => ok

#----new ENTRYPOINT

#ENTRYPOINT "yarn run start" => ok
#ENTRYPOINT yarn run start  => not ok
#ENTRYPOINT bash -c "yarn run start"


#ENTRYPOINT ["/bin/bash", "-c", "yarn run start"] => not ok
#ENTRYPOINT ["/bin/sh", "-c", "yarn run start"] => not ok
#ENTRYPOINT ["/bin/sh", "yarn run start"] => not ok

#ENTRYPOINT [ "bash", "-c", "yarn run start" ] => not ok
#ENTRYPOINT ["sh", "-c", "yarn run start"] => not ok

#
#ENTRYPOINT [ "yarn run start" ] => ok

# treat this container as an executable
#ENTRYPOINT [ "nodemon", "app.js" ] works
