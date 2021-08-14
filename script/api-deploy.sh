#!/bin/bash

# define variables
header_accept='application/vnd.github.v3+json'
user_name='sbk0716'
repository_name='reporting-api'
environment='staging'
deployments_endpoint="https://api.github.com/repos/${user_name}/${repository_name}/deployments"

# define token
echo "Enter your GitHub Personal Access Token."
read token
# define branch
echo "Enter the Branch Name you want to deploy. (e.g.)feature/XXX-1"
read branch
# define api
echo "Enter the REST API Name you want to deploy. (e.g.)reporting-api"
read api

# check if token is an empty string
if [ -z "${token}" ]; then
  echo "token is an empty string."
  exit 1
fi
# check if branch is an empty string
if [ -z "${branch}" ]; then
  echo "branch is an empty string."
  exit 1
fi
# check if branch is main
if [ "${branch}" = "main" ]; then
  echo "branch is main."
  exit 1
fi
# check if api is an empty string
if [ -z "${api}" ]; then
  echo "api is an empty string."
  exit 1
fi
# check if api is reporting-api
if [ "${api}" = "reporting-api" ]; then
  echo "api is reporting-api."
  else
  echo "api is not reporting-api."
  exit 1
fi

# define payload
payload=$(cat << EOS
{"ref": "${branch}","task": "${api}","environment": "${environment}"}
EOS
)

# create a deployment using Github Deployment API
deployment_resp=$(curl -X POST -H "Accept: ${header_accept}" \
-H "Authorization: token ${token}" \
-d "${payload}" \
"${deployments_endpoint}")
deployment_id=$(echo "${deployment_resp}" | jq -r '.id')
deployments_statuses_endpoint="https://api.github.com/repos/${user_name}/${repository_name}/deployments/${deployment_id}/statuses"
echo "deployment_resp= ${deployment_resp}"

# create a deployment status using Github Deployment API
deployment_status_resp=$(curl -X POST -H "Accept: ${header_accept}" \
-H "Authorization: token ${token}" \
-d '{"state":"success"}' \
"${deployments_statuses_endpoint}")
deployment_status_state=$(echo "${deployment_status_resp}" | jq -r '.state')
echo "deployment_status_state= ${deployment_status_state}"