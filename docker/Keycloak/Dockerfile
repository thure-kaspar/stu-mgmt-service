# Base image
FROM quay.io/keycloak/keycloak

# Upload and import realm config (incl. users) into keycloak
RUN mkdir /opt/keycloak/data/import
COPY oidctest-realm.json /opt/keycloak/data/import
COPY master-realm.json /opt/keycloak/data/import
RUN /opt/keycloak/bin/kc.sh import --dir /opt/keycloak/data/import

# Entrypoint of regular keycloak base image
EXPOSE 8080
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

