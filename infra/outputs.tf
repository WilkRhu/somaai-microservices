output "public_ip" {
  value       = aws_eip.somaai.public_ip
  description = "IP público da EC2"
}

output "ssh_command" {
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.somaai.public_ip}"
  description = "Comando SSH para acessar a instância"
}
