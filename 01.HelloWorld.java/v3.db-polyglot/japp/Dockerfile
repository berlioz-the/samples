FROM maven:3.5.4-jdk-11-slim AS build  
COPY pom.xml /usr/src/app/  
RUN mvn -B -f /usr/src/app/pom.xml -s /usr/share/maven/ref/settings-docker.xml dependency:resolve
COPY src /usr/src/app/src  
RUN mvn -B -f /usr/src/app/pom.xml -s /usr/share/maven/ref/settings-docker.xml package

FROM openjdk:11-jdk-slim
COPY --from=build /usr/src/app/target/*.jar /usr/app/
EXPOSE 8080  
ENTRYPOINT ["java", "-XshowSettings:vm", "-jar","/usr/app/application.jar"]  