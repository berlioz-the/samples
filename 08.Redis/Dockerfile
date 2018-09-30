
FROM berliozcloud/golang-1.10 as builder

ADD src/ /go/src/app
RUN dep ensure -v

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main .
RUN ls -la /app/main


FROM redis:4

COPY --from=builder /app/main /usr/local/bin/berlioz_configurator
RUN ls -la /usr/local/bin/berlioz_configurator

RUN \
  apt-get update && \
  apt-get install -y ruby

RUN gem install redis

ADD redis-trib.rb /var/local/redis/

ENTRYPOINT ["/usr/local/bin/berlioz_configurator"]