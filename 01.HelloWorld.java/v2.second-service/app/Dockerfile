FROM maven:3.5.4-jdk-11-slim AS build  
COPY src /usr/src/app/src  
COPY pom.xml /usr/src/app  
RUN mvn -f /usr/src/app/pom.xml clean package

FROM openjdk:11-jdk-slim
COPY --from=build /usr/src/app/target/*.jar /usr/app/
EXPOSE 8080  
ENTRYPOINT ["java", "-XshowSettings:vm", "-jar","/usr/app/application.jar"]  