###############################################################################
# Step 1 : Builder image
FROM maven:3.5.4-jdk-11-slim AS build
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY pom.xml .
RUN mvn -B -s /usr/share/maven/ref/settings-docker.xml dependency:resolve
COPY src src
RUN mvn -B -s /usr/share/maven/ref/settings-docker.xml package

###############################################################################
# Step 2 : Runner image
FROM openjdk:11-jdk-slim
COPY --from=build /usr/src/app/target/*.jar /usr/app/
EXPOSE 8080
ENTRYPOINT ["java", "-XshowSettings:vm", "-jar","/usr/app/application.jar"]
