set -e
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
clear
echo '-----------------'
printf "${YELLOW}BLNQ STUDIO SETUP ${NC}\n"
echo '-----------------'
echo
printf "${YELLOW}1: Postgres Setup (1-4)${NC}\n"
echo

PG_HOST=$(grep PG_HOST .env | cut -d '=' -f2)
PG_USER=$(grep PG_USER .env | cut -d '=' -f2)
PG_NAME=$(grep PG_NAME .env | cut -d '=' -f2)
PG_PWD=$(grep PG_PWD .env | cut -d '=' -f2)
PG_SSL=$(grep PG_SSL .env | cut -d '=' -f2)

echo
printf "${YELLOW}2: Database Creation (2-4)${NC}\n"
echo

   createdb ${PG_DB}
        psql ${PG_DB} -c "CREATE USER ${PG_USER} WITH PASSWORD '${PG_PWD}' SUPERUSER;"
        psql ${PG_DB} < ./scripts/blnq.dump

echo
printf "${YELLOW}3: Security Setup (3-4)${NC}\n"
echo
JWT_SECRET=$(grep JWT_SECRET_DEFAULT .env | cut -d '=' -f2)




