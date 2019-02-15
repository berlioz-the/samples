FROM mysql:5.7

COPY scripts/init.sql /docker-entrypoint-initdb.d/

COPY docker-entrypoint-berlioz.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-berlioz.sh

ENTRYPOINT ["docker-entrypoint-berlioz.sh"]
CMD ["mysqld"]
