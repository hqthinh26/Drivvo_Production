FROM node:10 
WORKDIR /usr/app
COPY package.json yarn.lock ./
RUN yarn install
COPY ./ .
RUN yarn global add sequelize sequelize-cli pg nodemon

#CMD bash -c "sequelize db:migrate && yarn run start" => OK but should move this command to the heroku.yml file 
# as it makes the code more transparent.

#ENTRYPOINT ["sequelize db:migrate", "&&", "yarn run start"] => Failed to build => as there is a command parse error
#if the command parse error is fixed, this one may work flawlessly as it conplies to the logic that i think i understand correctly

#Below is valuable material

#-c is shell option - not argument
#-----NEW CMD Final: Hoat dong nhu 1 terminal binh thuong
#CMD "yarn run start" => not ok
#CMD yarn run start => ok
#CMD bash -c "yarn run start" => ok

#CMD ["/bin/bash", "-c", "yarn run start"] => ok
#CMD ["/bin/sh", "-c", "yarn run start"] => ok
#CMD ["/bin/sh", "yarn run start"] => not ok
#CMD ["/bin/bash", "-c", "nodemon app.js"] => ok

#CMD ["bash", "-c", "yarn run start"] => ok
#CMD ["sh", "-c", "yarn run start"] => ok

#----new ENTRYPOINT

#ENTRYPOINT "yarn run start" => ok
#ENTRYPOINT ["sequelize db:migrate", "&&", "yarn run start"]

#ENTRYPOINT yarn run start  => not ok
#ENTRYPOINT bash -c "yarn run start" => abundun => not ok


#ENTRYPOINT ["/bin/bash", "-c", "yarn run start"] => not ok
#ENTRYPOINT ["/bin/sh", "-c", "yarn run start"] => not ok
#ENTRYPOINT ["/bin/sh", "yarn run start"] => not ok

#ENTRYPOINT [ "bash", "-c", "yarn run start" ] => not ok
#ENTRYPOINT ["sh", "-c", "yarn run start"] => not ok


# treat this container as an executable ok
#ENTRYPOINT [ "nodemon" ] 
#CMD [ "app.js" ] 

#ENTRYPOINT [ "nodemon app.js && echo $0" ] not ok
#ENTRYPOINT ["nodemon app.js"] ok
#ENTRYPOINT [ "node --version" ] ok

#ENTRYPOINT exec bash -c "echo $0 && nodemon app.js"  => not ok
