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

PG_HOST_DEFAULT="localhost"
read -p "Enter PG_HOST: [default=${PG_HOST_DEFAULT}] " PG_HOST 
: ${PG_HOST:=$PG_HOST_DEFAULT}

PG_DB_DEFAULT="blnq_db"
read -p "Enter PG_DB: [default=${PG_DB_DEFAULT}] " PG_DB
: ${PG_DB:=$PG_DB_DEFAULT}

PG_USER_DEFAULT="blnq_user"
read -p "Enter PG_USER: [default=${PG_USER_DEFAULT}] " PG_USER
: ${PG_USER:=$PG_USER_DEFAULT}

PG_PWD_DEFAULT="qwerty123"
read -p "Enter PG_PWD: [default=${PG_PWD_DEFAULT}] " PG_PWD
: ${PG_PWD:=$PG_PWD_DEFAULT}

PG_SSL_DEFAULT="false"
read -p "Use SSL for DB: [default=${PG_SSL_DEFAULT}] " PG_SSL
: ${PG_SSL:=$PG_SSL_DEFAULT}

PUPPETEER_EXECUTABLE_PATH_DEFAULT="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
read -p "PUPPETEER_EXECUTABLE_PATH: [default=${PUPPETEER_EXECUTABLE_PATH_DEFAULT}] " PUPPETEER_EXECUTABLE_PATH
: ${PUPPETEER_EXECUTABLE_PATH:=$PUPPETEER_EXECUTABLE_PATH_DEFAULT}


echo
printf "${YELLOW}2: Database Creation (2-4)${NC}\n"
echo

while true; do
    read -p "Do you want to create the PG DB (needs postgres to be running and createdb & psql binaries)? (Y/n) " yn
    case $yn in
        [Yy]* ) 
        createdb ${PG_DB}
        psql ${PG_DB} -c "CREATE USER ${PG_USER} WITH PASSWORD '${PG_PWD}' SUPERUSER;"
        psql ${PG_DB} < ./scripts/blnq.dump
        break;;
        [Nn]* ) break;;
        * ) echo "Please answer Y or n.";;
    esac
done

echo
printf "${YELLOW}3: Security Setup (3-4)${NC}\n"
echo
JWT_SECRET_DEFAULT="JWT_Secret_Phrase"
read -p "Enter JSON Webtoken phrase: [default=${JWT_SECRET_DEFAULT}] " JWT_SECRET
: ${JWT_SECRET:=$JWT_SECRET_DEFAULT}


echo
printf "${YELLOW}4: Installing Packages (4-4)${NC}\n"
echo
while true; do
    read -p "Do you want to install the Node Packages? (Y/n) " yn
    case $yn in
        [Yy]* ) 
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm i
        break;;
        [Nn]* ) break;;
        * ) echo "Please answer Y or n.";;
    esac
done


echo "PG_HOST=${PG_HOST}
PG_NAME=${PG_DB}
PG_USER=${PG_USER}
PG_PWD=${PG_PWD}
PG_SSL=${PG_SSL}
JWT_SECRET=${JWT_SECRET}
PUPPETEER_EXECUTABLE_PATH=${PUPPETEER_EXECUTABLE_PATH}
NODE_ENV=development" > .env


echo
echo '--------------------------------------------------'
printf "${YELLOW}Complete: run 'npm run build && node server' to start${NC}\n"
echo '--------------------------------------------------'
echo
