/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import React, { useState } from "react";
import {
  WizardFooter,
  WizardContextConsumer,
  Button,
  Wizard
} from "@patternfly/react-core";
import { useQuery } from "@apollo/react-hooks";
import { Loading } from "use-patternfly";
import {
  ProjectTypeConfigurationStep,
  IIoTProjectInput,
  IoTConfigurationStep,
  isMessagingProjectValid,
  isIoTProjectValid,
  isMessagingProjectConfigurationValid
} from "modules/project";
import { useMutationQuery } from "hooks";
import {
  CREATE_ADDRESS_SPACE,
  RETURN_NAMESPACES,
  RETURN_ADDRESS_SPACE_SCHEMAS
} from "graphql-module";
import { CREATE_IOT_PROJECT } from "graphql-module/queries/iot_project";
import {
  getQueryVariableForCreateMessagingProject,
  isEnabledCertificateStep,
  isRouteStepValid
} from "modules/project/utils";
import { IAddressSpaceSchema } from "schema";
import {
  INamespaces,
  MessagingProjectConfiguration,
  MessagingProjectReview,
  ConfiguringRoutes,
  ConfiguringCertificates
} from "modules/project/dailogs";
import { EndpointConfiguration } from "modules/project/components";
import { IoTProjectReview } from "./IotProjectReview";

export interface IRouteConf {
  protocol: string;
  hostname?: string;
  tlsTermination?: string;
}
export interface IMessagingProject {
  namespace: string;
  name: string;
  type?: string;
  plan?: string;
  authService?: string;
  customizeEndpoint: boolean;
  isNameValid: boolean;
  certValue?: string;
  addCertificate: boolean;
  tlsCertificate?: string;
  protocols?: string[];
  privateKey?: string;
  addRoutes: boolean;
  routesConf?: IRouteConf[];
}

export interface IExposeEndPoint {
  name?: string;
  service?: string;
  certificate?: {
    provider: string;
    tlsKey?: string;
    tlsCert?: string;
  };
  expose?: IExposeRoute;
}
export interface IExposeRoute {
  routeHost?: string;
  type?: string;
  routeServicePort?: string;
  routeTlsTermination?: string;
}
export interface IExposeMessagingProject {
  as: {
    metadata: {
      name: string;
      namespace: string;
    };
    spec: {
      type?: string;
      plan?: string;
      authenticationService: {
        name?: string;
      };
      endpoints?: IExposeEndPoint[];
    };
  };
}

const initialMessageProject: IMessagingProject = {
  name: "",
  namespace: "",
  type: "",
  isNameValid: true,
  addCertificate: false,
  customizeEndpoint: false,
  addRoutes: false
};

const initialIoTProject: IIoTProjectInput = {
  iotProjectName: "",
  namespace: "",
  isNameValid: true,
  isEnabled: true
};

const CreateProject: React.FunctionComponent = () => {
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [routeDetail, setRouteDetail] = useState<{
    name: string;
    namespace: string;
    type?: string;
    enabled?: boolean;
  }>();
  const [messagingProjectDetail, setMessagingProjectDetail] = useState<
    IMessagingProject
  >(initialMessageProject);
  const [iotProjectDetail, setIotProjectDetail] = useState<IIoTProjectInput>(
    initialIoTProject
  );
  const [firstSelectedStep, setFirstSelectedStep] = useState<string>("iot");

  const onToggle = () => {
    setFirstSelectedStep("iot");
    setIotProjectDetail(initialIoTProject);
    setMessagingProjectDetail(initialMessageProject);
    setIsWizardOpen(!isWizardOpen);
  };

  const resetForm = () => {
    setMessagingProjectDetail(initialMessageProject);
    setIotProjectDetail(initialIoTProject);
    setFirstSelectedStep("iot");
    setIsWizardOpen(!isWizardOpen);
  };

  const refetchQueries: string[] = ["allProjects"];

  const [setMessagingVariables] = useMutationQuery(
    CREATE_ADDRESS_SPACE,
    refetchQueries,
    resetForm,
    resetForm
  );

  const [setIoTVariables] = useMutationQuery(
    CREATE_IOT_PROJECT,
    refetchQueries,
    resetForm,
    resetForm
  );

  const { data: addressSpaceSchema } = useQuery<IAddressSpaceSchema>(
    RETURN_ADDRESS_SPACE_SCHEMAS
  ) || { data: { addressSpaceSchema: [] } };

  const handleMessagingProjectSave = async () => {
    if (
      messagingProjectDetail &&
      isMessagingProjectValid(messagingProjectDetail)
    ) {
      await setMessagingVariables(
        getQueryVariableForCreateMessagingProject(messagingProjectDetail)
      );
      setRouteDetail({
        name: messagingProjectDetail.name || "",
        namespace: messagingProjectDetail.namespace || "",
        type: messagingProjectDetail.type
      });
    }
  };

  const { loading, data } = useQuery<INamespaces>(RETURN_NAMESPACES);

  if (loading) return <Loading />;

  const { namespaces } = data || {
    namespaces: []
  };

  const namespaceOptions = namespaces.map(namespace => {
    return {
      value: namespace.metadata.name,
      label: namespace.metadata.name,
      key: namespace.metadata.name
    };
  });

  const handleIoTProjectSave = async () => {
    if (iotProjectDetail && isIoTProjectValid(iotProjectDetail)) {
      const variables = {
        project: {
          metadata: {
            name: iotProjectDetail.iotProjectName,
            namespace: iotProjectDetail.namespace
          },
          enabled: iotProjectDetail.isEnabled
        }
      };
      setIoTVariables(variables);
      setRouteDetail({
        name: iotProjectDetail.iotProjectName || "",
        namespace: iotProjectDetail.namespace || "",
        enabled: iotProjectDetail.isEnabled
      });
    }
  };

  const step1 = {
    name: "Project Type",
    component: (
      <ProjectTypeConfigurationStep
        selectedStep={firstSelectedStep}
        setSelectedStep={setFirstSelectedStep}
      />
    )
  };

  const configurationStepForIot = IoTConfigurationStep(
    setIotProjectDetail,
    namespaceOptions,
    iotProjectDetail
  );

  const finalStepForIot = {
    name: "Review",
    isDisabled: true,
    component: <IoTProjectReview projectDetail={iotProjectDetail} />,
    enableNext: isIoTProjectValid(iotProjectDetail),
    nextButtonText: "Finish"
  };

  let steps: any[] = [step1];

  const messagingConfigurationStep = {
    name: "Configuration",
    component: (
      <MessagingProjectConfiguration
        projectDetail={messagingProjectDetail}
        addressSpaceSchema={addressSpaceSchema}
        setProjectDetail={setMessagingProjectDetail}
        namespaces={namespaceOptions}
      />
    )
  };

  const endpointConfiguringStep = {
    name: "Configuring",
    component: (
      <EndpointConfiguration
        setProjectDetail={setMessagingProjectDetail}
        addressSpaceSchema={addressSpaceSchema}
        projectDetail={messagingProjectDetail}
      />
    )
  };

  const endpointCertificatesStep = {
    name: "Certificates",
    component: (
      <ConfiguringCertificates
        projectDetail={messagingProjectDetail}
        setProjectDetail={setMessagingProjectDetail}
      />
    )
  };

  const endpointRoutesStep = {
    name: "Routes",
    component: (
      <ConfiguringRoutes
        projectDetail={messagingProjectDetail}
        addressSpaceSchema={addressSpaceSchema}
        setProjectDetail={setMessagingProjectDetail}
      />
    )
  };

  const endpointCustomizationStep = {
    name: "Endpoint customization",
    steps: [
      ...[endpointConfiguringStep],
      ...(messagingProjectDetail.addCertificate
        ? [endpointCertificatesStep]
        : []),
      ...(messagingProjectDetail.addRoutes ? [endpointRoutesStep] : [])
    ],
    canJumpTo: isMessagingProjectValid(messagingProjectDetail)
  };

  const messagingReviewStep = {
    name: "Review",
    component: (
      <MessagingProjectReview projectDetail={messagingProjectDetail} />
    ),
    canJumpTo: isMessagingProjectValid(messagingProjectDetail),
    nextButtonText: "Finish"
  };

  if (firstSelectedStep === "iot") {
    steps.push(configurationStepForIot);
    steps.push(finalStepForIot);
  } else {
    steps.push(messagingConfigurationStep);
    if (messagingProjectDetail.customizeEndpoint) {
      steps = [...steps, endpointCustomizationStep];
    }
    steps.push(messagingReviewStep);
  }

  const handleNextIsEnabled = (step?: any) => {
    if (firstSelectedStep) {
      if (firstSelectedStep === "messaging") {
        if (step === "Configuration") {
          return isMessagingProjectConfigurationValid(messagingProjectDetail);
        } else if (step === "Configuring") {
          return isMessagingProjectValid(messagingProjectDetail);
        } else if (step === "Certificates") {
          return (
            isMessagingProjectValid(messagingProjectDetail) &&
            isEnabledCertificateStep(messagingProjectDetail)
          );
        } else if (step === "Routes") {
          return (
            isMessagingProjectValid(messagingProjectDetail) &&
            isEnabledCertificateStep(messagingProjectDetail) &&
            isRouteStepValid(messagingProjectDetail)
          );
        } else {
          return isMessagingProjectConfigurationValid(messagingProjectDetail);
        }
      } else if (firstSelectedStep === "iot") {
        if (isIoTProjectValid(iotProjectDetail)) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  };

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, onNext, onBack, onClose }) => {
          if (
            activeStep.name === "Project Type" ||
            activeStep.name === "Finish"
          ) {
            return (
              <>
                <Button
                  variant="primary"
                  type="submit"
                  id="create-project-next-button"
                  onClick={onNext}
                  className={!firstSelectedStep ? "pf-m-disabled" : ""}
                >
                  Next
                </Button>
                <Button
                  variant="secondary"
                  id="create-project-back-button"
                  onClick={onBack}
                  className={
                    activeStep.name === "Project Type" ? "pf-m-disabled" : ""
                  }
                >
                  Back
                </Button>
                <Button
                  variant="link"
                  id="create-project-cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </>
            );
          }
          if (activeStep.name !== "Review") {
            return (
              <>
                <Button
                  variant="primary"
                  type="submit"
                  id="create-project-next-button"
                  onClick={onNext}
                  className={
                    handleNextIsEnabled(activeStep.name) ? "" : "pf-m-disabled"
                  }
                >
                  Next
                </Button>
                <Button
                  variant="secondary"
                  id="create-project-back-button"
                  onClick={onBack}
                >
                  Back
                </Button>
                <Button
                  variant="link"
                  id="create-project-cancel-button"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </>
            );
          }

          return (
            <>
              <Button
                variant="primary"
                type="submit"
                id="create-project-finish-button"
                onClick={
                  firstSelectedStep && firstSelectedStep === "messaging"
                    ? handleMessagingProjectSave
                    : handleIoTProjectSave
                }
              >
                Finish
              </Button>
              <Button
                onClick={onBack}
                id="create-project-back-button"
                variant="secondary"
              >
                Back
              </Button>
              <Button variant="link" id="cancel-button" onClick={onClose}>
                Cancel
              </Button>
            </>
          );
        }}
      </WizardContextConsumer>
    </WizardFooter>
  );

  return (
    <>
      <Button variant="primary" id="create-project-button" onClick={onToggle}>
        Create
      </Button>
      {isWizardOpen && (
        <Wizard
          isOpen={isWizardOpen}
          onClose={onToggle}
          footer={CustomFooter}
          id={"create-project-wizard"}
          title="Create"
          description="Following three steps to create new project"
          steps={steps}
        />
      )}
    </>
  );
};

export { CreateProject };
