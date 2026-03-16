terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security Group
resource "aws_security_group" "somaai" {
  name        = "somaai-sg"
  description = "SomaAI microservices"

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Monolith
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Orchestrator
  ingress {
    from_port   = 3009
    to_port     = 3009
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Auth
  ingress {
    from_port   = 3010
    to_port     = 3010
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Business
  ingress {
    from_port   = 3011
    to_port     = 3011
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Notifications
  ingress {
    from_port   = 3015
    to_port     = 3015
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "somaai-sg"
  }
}

# Key pair (você precisa ter a chave localmente)
resource "aws_key_pair" "somaai" {
  key_name   = "somaai-key"
  public_key = file(var.public_key_path)
}

# EC2
resource "aws_instance" "somaai" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.somaai.key_name
  vpc_security_group_ids = [aws_security_group.somaai.id]

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh", {
    repo_url      = "https://${var.github_token}@github.com/WilkRhu/somaai-microservices.git"
    env_file      = var.env_file_content
  })

  tags = {
    Name = "somaai-server"
  }
}

# Elastic IP
resource "aws_eip" "somaai" {
  instance = aws_instance.somaai.id
  domain   = "vpc"

  tags = {
    Name = "somaai-eip"
  }
}
