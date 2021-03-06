/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import React, { useState } from "react";
import { useA11yRouteChange, useDocumentTitle, Loading } from "use-patternfly";
import { ISortBy, SortByDirection } from "@patternfly/react-table";
import { useQuery, useApolloClient } from "@apollo/react-hooks";
import { compareObject } from "utils";
import {
  IProject,
  ProjectList,
  IProjectCount
} from "modules/project/components";
import { IProjectFilter } from "modules/project/ProjectPage";
import {
  ProjectTypes,
  StatusTypes,
  ProjectType,
  getFilteredProjectsCount
} from "modules/project/utils";
import { useStoreContext, types, MODAL_TYPES } from "context-state-reducer";
import { useMutationQuery } from "hooks";
import {
  DELETE_MESSAGING_PROJECT,
  DELETE_IOT_PROJECT,
  TOGGLE_IOT_PROJECTS_STATUS,
  RETURN_ALL_PROJECTS,
  RETURN_COUNT_PROJECTS,
  DOWNLOAD_CERTIFICATE
} from "graphql-module";
import {
  IAllProjectsResponse,
  IAddressSpaceType,
  IIotProjectType
} from "schema/iot_project";
import { POLL_INTERVAL, FetchPolicy } from "constant";

export interface IProjectListContainerProps {
  page: number;
  perPage: number;
  setTotalProjects: (value: number) => void;
  filter: IProjectFilter;
  sortValue?: ISortBy;
  setSortValue: (value: ISortBy) => void;
  onSelectProject: (
    data: IProject,
    isSelected: boolean,
    isAllSelected?: boolean
  ) => void;
  selectedProjects: IProject[];
  isAllProjectSelected: boolean;
  selectAllProjects: (projects: IProject[]) => void;
  setCount: (count: IProjectCount, type: ProjectType) => void;
  setIsAllSelected: (value: boolean) => void;
}

export const ProjectListContainer: React.FC<IProjectListContainerProps> = ({
  page,
  perPage,
  setTotalProjects,
  filter,
  sortValue,
  setSortValue,
  onSelectProject,
  selectedProjects,
  isAllProjectSelected,
  selectAllProjects,
  setCount,
  setIsAllSelected
}) => {
  useDocumentTitle("Addressspace List");
  useA11yRouteChange();
  const client = useApolloClient();
  const { dispatch } = useStoreContext();
  const [sortBy, setSortBy] = useState<ISortBy>();
  const refetchQueries: string[] = ["allProjects"];
  const [setDeleteMsgProjectQueryVariables] = useMutationQuery(
    DELETE_MESSAGING_PROJECT,
    refetchQueries
  );
  const [
    setToggleIoTProjectQueryVariables
  ] = useMutationQuery(TOGGLE_IOT_PROJECTS_STATUS, ["allProjects"]);

  const [
    setDeleteIoTProjectQueryVariables
  ] = useMutationQuery(DELETE_IOT_PROJECT, ["allProjects"]);

  var project_count = useQuery<IAllProjectsResponse>(RETURN_COUNT_PROJECTS(), {
    fetchPolicy: FetchPolicy.NETWORK_ONLY,
    pollInterval: POLL_INTERVAL
  });

  const projectsData = (project_count && project_count.data) || {
    allProjects: { total: 0, objects: [] }
  };

  const { loading, data } = useQuery<IAllProjectsResponse>(
    RETURN_ALL_PROJECTS(page, perPage, filter, undefined, sortBy),
    {
      fetchPolicy: FetchPolicy.NETWORK_ONLY,
      pollInterval: POLL_INTERVAL
    }
  );

  if (loading) {
    return <Loading />;
  }

  const { allProjects } = data || {
    allProjects: { total: 0, objects: [] }
  };

  const projects = allProjects?.objects || [];

  setTotalProjects(allProjects?.total || 0);

  if (sortValue && sortBy !== sortValue) {
    setSortBy(sortValue);
  }

  const onChangeEdit = (project: IProject) => {
    dispatch({
      type: types.SHOW_MODAL,
      modalType: MODAL_TYPES.EDIT_PROJECT,
      modalProps: {
        project
      }
    });
  };

  const onDeleteProject = (project: IProject) => {
    if (project && project.name && project.namespace) {
      const index = selectedProjects.findIndex(
        prj => prj.name === project.name && prj.namespace === project.namespace
      );
      selectAllProjects(selectedProjects.splice(index, 1));
      if (project.projectType === ProjectTypes.MESSAGING) {
        const queryVariable = {
          as: [
            {
              name: project.name,
              namespace: project.namespace
            }
          ]
        };
        setDeleteMsgProjectQueryVariables(queryVariable);
      } else {
        const queryVariable = {
          a: [
            {
              name: project.name,
              namespace: project.namespace
            }
          ]
        };
        setDeleteIoTProjectQueryVariables(queryVariable);
      }
    }
  };

  const onChangeDelete = (project: IProject) => {
    if (project.projectType === ProjectTypes.MESSAGING) {
      dispatch({
        type: types.SHOW_MODAL,
        modalType: MODAL_TYPES.DELETE_PROJECT,
        modalProps: {
          selectedItems: [project.name],
          data: project,
          onConfirm: onDeleteProject,
          option: "Delete",
          detail: `Are you sure you want to delete this messaging project: ${project.name} ?`,
          header: "Delete this Messaging Project ?",
          confirmButtonLabel: "Delete",
          iconType: "danger"
        }
      });
    } else if (project.projectType === ProjectTypes.IOT) {
      dispatch({
        type: types.SHOW_MODAL,
        modalType: MODAL_TYPES.DELETE_PROJECT,
        modalProps: {
          selectedItems: [project.name],
          data: project,
          onConfirm: onDeleteProject,
          option: "Delete",
          detail: `All data will be deleted and unrecoverable`,
          header: "Delete this IoT Project ?",
          confirmButtonLabel: "Delete",
          iconType: "danger"
        }
      });
    }
  };

  //Download the certificate function
  const onDownloadCertificate = async (project: IProject) => {
    const dataToDownload = await client.query({
      query: DOWNLOAD_CERTIFICATE,
      variables: {
        as: {
          name: project.name,
          namespace: project.namespace
        }
      },
      fetchPolicy: FetchPolicy.NETWORK_ONLY
    });
    if (dataToDownload.errors) {
      console.log("Error while download", dataToDownload.errors);
    }
    const url = window.URL.createObjectURL(
      new Blob([dataToDownload.data.messagingCertificateChain])
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${project.name}.crt`);
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) link.parentNode.removeChild(link);
  };

  const handleOnChangeEnable = (project: IProject) => {
    const queryVariable = {
      a: [
        {
          name: project.name,
          namespace: project.namespace
        }
      ],
      status: !project.isEnabled
    };
    setToggleIoTProjectQueryVariables(queryVariable);
  };

  const onEnable = (project: IProject) => {
    dispatch({
      type: types.SHOW_MODAL,
      modalType: MODAL_TYPES.DELETE_PROJECT,
      modalProps: {
        selectedItems: [project.name],
        data: project,
        onConfirm: () => handleOnChangeEnable(project),
        option: "Enable",
        detail: `Are you sure you want to enable this iot project: ${project.name} ?`,
        header: "Enable this IoT Project ?",
        confirmButtonLabel: "Enable"
      }
    });
  };

  const onDisable = (project: IProject) => {
    dispatch({
      type: types.SHOW_MODAL,
      modalType: MODAL_TYPES.DELETE_PROJECT,
      modalProps: {
        selectedItems: [project.name],
        data: project,
        onConfirm: () => handleOnChangeEnable(project),
        option: "Disable",
        detail: `Devices under this project will stop sending and receiving messages and commands with the system`,
        header: "Disable this IoT Project ?",
        confirmButtonLabel: "Disable"
      }
    });
  };

  const getProjects = (
    projects: Array<IAddressSpaceType | IIotProjectType>
  ) => {
    return projects.map((project: any) => {
      if (project.kind === "IoTProject") {
        const { metadata, iotStatus, enabled } = project || {};
        return {
          projectType: ProjectTypes.IOT,
          name: metadata?.name,
          displayName: metadata?.name,
          isEnabled: enabled,
          namespace: metadata?.namespace,
          status: iotStatus?.phase,
          creationTimestamp: metadata?.creationTimestamp
        };
      } else {
        const { metadata, spec, messagingStatus, addresses, connections } =
          project || {};

        const a = {
          projectType: ProjectTypes.MESSAGING,
          name: metadata?.name,
          displayName: metadata?.name,
          namespace: metadata?.namespace,
          creationTimestamp: metadata?.creationTimestamp,
          status: messagingStatus?.phase,
          type: spec?.type,
          authService: spec.authenticationService?.name,
          plan: spec?.plan?.metadata?.name,
          addressCount: addresses?.total,
          connectionCount: connections?.total
        };
        return a;
      }
    });
  };

  const projectList: IProject[] = getProjects(projects);

  const projectInfo =
    projectsData && getProjects(projectsData.allProjects.objects || []);

  const ioTCount: IProjectCount = {
    total: getFilteredProjectsCount(ProjectTypes.IOT, projectInfo),
    failed: getFilteredProjectsCount(
      ProjectTypes.IOT,
      projectInfo,
      StatusTypes.FAILED
    ),
    active: getFilteredProjectsCount(
      ProjectTypes.IOT,
      projectInfo,
      StatusTypes.ACTIVE
    ),
    pending: getFilteredProjectsCount(
      ProjectTypes.IOT,
      projectInfo,
      StatusTypes.PENDING
    ),
    configuring: getFilteredProjectsCount(
      ProjectTypes.IOT,
      projectInfo,
      StatusTypes.CONFIGURING
    )
  };

  const msgCount: IProjectCount = {
    total: getFilteredProjectsCount(ProjectTypes.MESSAGING, projectInfo),
    failed: getFilteredProjectsCount(
      ProjectTypes.MESSAGING,
      projectInfo,
      StatusTypes.FAILED
    ),
    active: getFilteredProjectsCount(
      ProjectTypes.MESSAGING,
      projectInfo,
      StatusTypes.ACTIVE
    ),
    pending: getFilteredProjectsCount(
      ProjectTypes.MESSAGING,
      projectInfo,
      StatusTypes.PENDING
    ),
    configuring: getFilteredProjectsCount(
      ProjectTypes.MESSAGING,
      projectInfo,
      StatusTypes.CONFIGURING
    )
  };

  setCount(ioTCount, ProjectType.IOT_PROJECT);
  setCount(msgCount, ProjectType.MESSAGING_PROJECT);

  const onSort = (_event: any, index: number, direction: SortByDirection) => {
    setSortBy({ index: index, direction: direction });
    setSortValue({ index: index, direction: direction });
  };

  if (isAllProjectSelected && selectedProjects.length !== projectList.length) {
    selectAllProjects(projectList);
  }

  const onSelect = (project: IProject, isSelected: boolean) => {
    if (!isAllProjectSelected && isSelected) {
      if (selectedProjects.length === projectList.length - 1) {
        let allSelected = true;
        for (let prj of projectList) {
          for (let selectedProject of selectedProjects) {
            if (compareObject(prj.name, selectedProject.name)) {
              if (project.name === prj.name) {
                allSelected = true;
              } else if (!prj.selected) allSelected = false;
              break;
            }
          }
        }
        if (allSelected) {
          onSelectProject(project, isSelected, true);
        }
      }
    }
    onSelectProject(project, isSelected);
  };

  const onSelectAll = (isSelected: boolean) => {
    setIsAllSelected(isSelected);
    if (isSelected) {
      selectAllProjects(projectList);
    } else {
      selectAllProjects([]);
    }
  };
  // if (projectList.every((row) => row.selected === true)) {
  //   setIsAllSelected(true);
  // }

  //TODO: logic will be removed after implementation of query
  for (let project of projectList) {
    project.selected =
      selectedProjects.filter(({ name, namespace }) => {
        const areProjectsEqual = compareObject(
          { name, namespace },
          {
            name: project.name,
            namespace: project.namespace
          }
        );
        return areProjectsEqual;
      }).length === 1;
  }

  return (
    <>
      <ProjectList
        onSort={onSort}
        projects={projectList}
        sortBy={sortBy}
        onEdit={onChangeEdit}
        onDelete={onChangeDelete}
        onDownload={onDownloadCertificate}
        onEnable={onEnable}
        onDisable={onDisable}
        onSelectProject={onSelect}
        onSelectAllProject={onSelectAll}
      />
    </>
  );
};
