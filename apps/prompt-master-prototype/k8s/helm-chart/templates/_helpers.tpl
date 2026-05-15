{{- define "prompt-master.name" -}}
{{- default .Chart.Name .Chart.Name -}}
{{- end -}}

{{- define "prompt-master.fullname" -}}
{{- printf "%s-%s" (include "prompt-master.name" .) .Release.Name -}}
{{- end -}}
