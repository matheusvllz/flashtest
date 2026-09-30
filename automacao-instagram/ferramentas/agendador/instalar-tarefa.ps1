# Instala (ou remove) a tarefa do Agendador de Tarefas do Windows que roda a fila de publicacao.
#
#   powershell -ExecutionPolicy Bypass -File ferramentas\agendador\instalar-tarefa.ps1
#   powershell -ExecutionPolicy Bypass -File ferramentas\agendador\instalar-tarefa.ps1 -Remover
#
# O que isto faz: a cada 15 minutos, enquanto voce estiver logado, roda `bun run fila` nesta pasta.
# O que isto NAO faz: nao roda com o computador desligado, suspenso ou sem internet; nao gera
# conteudo; nao chama IA. Publica apenas o que ja esta "agendado" no historico.
# A saida de cada execucao vai para logs\fila.log.

param([switch]$Remover)

$nome = "Foca - fila do Instagram"
$pasta = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

if ($Remover) {
  Unregister-ScheduledTask -TaskName $nome -Confirm:$false -ErrorAction SilentlyContinue
  Write-Output "Tarefa '$nome' removida."
  exit 0
}

$bun = (Get-Command bun -ErrorAction Stop).Source
$acao = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"`"$bun`" run fila >> `"$pasta\logs\fila.log`" 2>&1`"" -WorkingDirectory $pasta
$gatilho = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15)
$config = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 20)
Register-ScheduledTask -TaskName $nome -Action $acao -Trigger $gatilho -Settings $config -Description "Publica no Instagram os conteudos agendados do Foca (automacao-instagram)." -Force | Out-Null
Write-Output "Tarefa '$nome' instalada: roda a cada 15 min em $pasta (log em logs\fila.log)."
Write-Output "Para conferir: Get-ScheduledTask -TaskName '$nome' | Get-ScheduledTaskInfo"
