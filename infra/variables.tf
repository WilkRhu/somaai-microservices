variable "aws_region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t3.small"
}

# Ubuntu 22.04 LTS us-east-1
variable "ami_id" {
  default = "ami-0c7217cdde317cfec"
}

variable "public_key_path" {
  description = "Caminho para sua chave SSH pública"
  default     = "~/.ssh/id_rsa.pub"
}

variable "repo_url" {
  description = "URL do repositório git"
  default     = "https://github.com/WilkRhu/somaai-microservices.git"
}

variable "github_token" {
  description = "GitHub Personal Access Token para clonar repo privado"
  sensitive   = true
  default     = ""
}

variable "env_file_content" {
  description = "Conteúdo do arquivo .env de produção"
  sensitive   = true
  default     = ""
}
