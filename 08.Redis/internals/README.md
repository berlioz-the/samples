## Running


### CONFIG
cluster_announce_ip
cluster_announce_port
cluster_announce_bus_port

### Ports

Cluent: 6379
Gossip: 16379

### Custom Image

docker build -t berlioz-docker .

docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-1 berlioz-docker redis-server /etc/redis/redis.conf

docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-2 berlioz-docker redis-server /etc/redis/redis.conf

### Configuring Cluster
https://get-reddie.com/blog/redis4-cluster-docker-compose/
https://www.ctolib.com/docs/sfile/redis-doc-cn/cn/topics/cluster-spec.html

ruby redis-trib.rb create --replicas 0  172.17.0.2:6379 172.17.0.3:6379 172.17.0.4:6379

### Kill All

docker kill redis-1; docker rm redis-1
docker kill redis-2; docker rm redis-2
docker kill redis-3; docker rm redis-3
docker kill redis-4; docker rm redis-4


### Redis 4
docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-1 redis redis-server /etc/redis/redis.conf

docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-2 redis redis-server /etc/redis/redis.conf

docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-3 redis redis-server /etc/redis/redis.conf


172.17.0.2
172.17.0.3


redis-cli cluster meet 172.17.0.2 6379



### Redis 5

172.17.0.2
172.17.0.3
172.17.0.4
172.17.0.5

docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-1 redis:5.0-rc redis-server /etc/redis/redis.conf
docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-2 redis:5.0-rc redis-server /etc/redis/redis.conf
docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-3 redis:5.0-rc redis-server /etc/redis/redis.conf
docker run -d -v d:/Repos/berlioz-corp/samples.git/08.Redis/docs/redis.conf:/etc/redis/redis.conf --name redis-4 redis:5.0-rc redis-server /etc/redis/redis.conf


redis-cli cluster create --cluster-replicas 2 172.17.0.2:6379 172.17.0.3:6379 172.17.0.4:6379 172.17.0.5:6379