job("Build and push rugpanov/regsync image") {
    startOn {
        gitPush { enabled = false }
    }

    docker {
        build {
            file = "Dockerfile"
        }

        push("registry.jetbrains.team/p/crl/docker-public/rugpanov/regsync") {
            tags("\$JB_SPACE_EXECUTION_NUMBER", "latest")
        }
    }
}