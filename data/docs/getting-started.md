# Getting Started

Once you have registered and have either a personal or professional license there are a few ways you can get started.  The easiest way is to use docker.  If you want full developmental control you can clone it through github as well.  Here is the repository: [yet-another-wiki repo](https://github.com/john-overton/yet-another-wiki "yet-another-wiki repo")

## Docker Setup:

:::tip
Here is a cheat sheet for Docker commands in the terminal: [Docker Cheat Sheet](https://docs.docker.com/get-started/docker_cheatsheet.pdf "Docker Cheat Sheet")
:::

1. &#x20;Download and install Docker Desktop: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/ "Download Docker Desktop")
2. &#x20;Download the image either by searching for it in Docker Desktop or by using the Docker Terminal, Mac\Linux Terminal or PowerShell: `docker pull joverton/yet-another-wiki-app`

![](/api/uploads/post-images/be762a9b866020ba938ed96caf153902-Docker-Desktop-naPOztyU3u.png)

1. Once you have downloaded the container you can start it within the app (it defaults to port 3000) or you can run the container through Terminal\Powershell

```shell
# 1. Ensure Docker Deamon is running
docker -d

# 2. Get list of Docker images
docker images

# 3. Start Yet-Another-Wiki image in the background based on image name or ID
docker up -d -p 3000:3000 <imageid or name>
```

1. Go to [https://localhost:3000](http://localhost:3000) and follow the setup wizard