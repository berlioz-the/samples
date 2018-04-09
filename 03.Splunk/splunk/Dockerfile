FROM splunk/splunk

COPY conf/http/inputs.conf /opt/splunk/etc/apps/splunk_httpinput/local/inputs.conf
COPY conf/launcher/inputs.conf /opt/splunk/etc/apps/launcher/local/inputs.conf

ENV SPLUNK_START_ARGS --accept-license
ENV SPLUNK_USER root
