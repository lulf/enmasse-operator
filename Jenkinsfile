#!/usr/bin/env groovy

def storeArtifacts(buildStatus) {
    if (buildStatus == 'ABORTED') {
        sh 'OPENSHIFT_TEST_LOGDIR="/tmp/testlogs" ./systemtests/scripts/collect_logs.sh "artifacts"'
    }
}

pipeline {
    agent {
        node {
            label 'enmasse'
        }
    }
    environment {
        STANDARD_JOB_NAME = 'enmasse-master-standard'
        BROKERED_JOB_NAME = 'enmasse-master-brokered'
    }
    parameters {
        string(name: 'TEST_CASE', defaultValue: 'SmokeTest', description: 'maven parameter for executing specific tests')
    }
    options {
        timeout(time: 1, unit: 'HOURS')
    }
    stages {
        stage('checkout') {
            steps {
                checkout scm
                sh 'git submodule update --init --recursive'
                sh 'rm -rf artifacts && mkdir -p artifacts'
            }
        }
        stage('build') {
            steps {
                withCredentials([string(credentialsId: 'docker-registry-host', variable: 'DOCKER_REGISTRY')]) {
                    sh 'MOCHA_ARGS="--reporter=mocha-junit-reporter" COMMIT=$BUILD_TAG make'
                    sh 'cat templates/install/openshift/enmasse.yaml'
                }
            }
        }
        stage('push docker image') {
            steps {
                withCredentials([string(credentialsId: 'docker-registry-host', variable: 'DOCKER_REGISTRY'), usernamePassword(credentialsId: 'docker-registry-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'TAG=$BUILD_TAG COMMIT=$BUILD_TAG make docker_tag'
                    sh '$DOCKER login -u $DOCKER_USER -p $DOCKER_PASS $DOCKER_REGISTRY'
                    sh 'TAG=$BUILD_TAG COMMIT=$BUILD_TAG make docker_push'
                }
            }
        }
        stage('start openshift') {
            steps {
                sh './systemtests/scripts/setup-openshift.sh'
                sh 'sudo chmod -R 777 /var/lib/origin/openshift.local.config'
            }
        }
        stage('system tests - smoke tests') {
            environment {
                ARTIFACTS_DIR = 'artifacts'
                JOB_NAME_SUB = "${String.format("%.15s", JOB_NAME)}"
                OPENSHIFT_PROJECT = "${JOB_NAME_SUB}${BUILD_NUMBER}"
            }
            steps {
                withCredentials([string(credentialsId: 'openshift-host', variable: 'OPENSHIFT_URL'), usernamePassword(credentialsId: 'openshift-credentials', passwordVariable: 'OPENSHIFT_PASSWD', usernameVariable: 'OPENSHIFT_USER')]) {
                    sh "./systemtests/scripts/run_test_component.sh templates/install /var/lib/origin/openshift.local.config/master/admin.kubeconfig systemtests ${params.TEST_CASE}"
                }
            }
        }
        stage('teardown openshift') {
            steps {
                sh './systemtests/scripts/teardown-openshift.sh'
            }
        }
        stage('execute brokered') {
            steps {
                build job: env.BROKERED_JOB_NAME, wait: false, parameters:
                        [
                                [$class: 'StringParameterValue', name: 'BUILD_TAG', value: String.valueOf(BUILD_TAG)],
                                [$class: 'StringParameterValue', name: 'MAILING_LIST', value: String.valueOf(params.MAILING_LIST)],
                                [$class: 'StringParameterValue', name: 'TEST_CASE', value: String.valueOf('brokered.**')],
                        ]
            }
        }
        stage('execute standard') {
            steps {
                build job: env.STANDARD_JOB_NAME, wait: false, parameters:
                        [
                                [$class: 'StringParameterValue', name: 'BUILD_TAG', value: String.valueOf(BUILD_TAG)],
                                [$class: 'StringParameterValue', name: 'MAILING_LIST', value: String.valueOf(params.MAILING_LIST)],
                                [$class: 'StringParameterValue', name: 'TEST_CASE', value: String.valueOf('standard.**')],
                        ]
            }
        }
    }
    post {
        always {
            storeArtifacts(currentBuild.result) //store artifacts if build was aborted - due to timeout reached
            //store test results from build and system tests
            junit '**/TEST-*.xml'

            //archive test results and openshift lofs
            archive '**/TEST-*.xml'
            archive 'artifacts/**'
            archive 'templates/install/**'
        }
        failure {
            echo "build failed"
            mail to: "$MAILING_LIST", subject: "EnMasse build has finished with ${result}", body: "See ${env.BUILD_URL}"
        }
    }
}
