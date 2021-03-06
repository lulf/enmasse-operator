/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import React, { useState } from "react";
import { JsonEditor } from "components";
import {
  IoTCertificateToolbar,
  CertificateForm,
  IoTCertificate
} from "modules/iot-certificates";
import {
  GridItem,
  Grid,
  PageSection,
  Flex,
  FlexItem,
  Switch,
  PageSectionVariants
} from "@patternfly/react-core";
import { StyleSheet, css } from "aphrodite";

export interface IIoTCertificate {
  "subject-dn"?: string | null;
  "public-key"?: string | null;
  "auto-provisioning-enabled"?: boolean | null;
  algorithm?: string | null;
  "not-before"?: string | null;
  "not-after"?: string | null;
}

export interface IIoTCertificateListProps {
  certificates: IIoTCertificate[];
  onSave: (certificate: IIoTCertificate) => void;
  onCreate: (certificate: IIoTCertificate) => void;
  onDelete: (certificate: IIoTCertificate) => void;
  onChangeStatus: (certificate: IIoTCertificate, isEnabled: boolean) => void;
}

const style = StyleSheet.create({
  no_top_bottom_padding: {
    paddingBottom: 0,
    paddingTop: 0
  },
  no_bottom_padding: {
    paddingBottom: 0
  }
});

export const IoTCertificateList: React.FunctionComponent<IIoTCertificateListProps> = ({
  certificates,
  onSave,
  onCreate,
  onDelete,
  onChangeStatus
}) => {
  const [showCertificateForm, setShowCertificateForm] = useState<boolean>(
    false
  );
  const [isJsonView, setIsJsonView] = useState<boolean>(false);

  const handleJsonViewChange = (value: boolean) => {
    setIsJsonView(value);

    // TODO: Show data in JSON Editor
  };

  return (
    <PageSection
      padding={{ default: "noPadding" }}
      variant={PageSectionVariants.default}
    >
      <Grid key={"iiid"}>
        <GridItem span={7}>
          <PageSection className={css(style.no_top_bottom_padding)}>
            {isJsonView ? (
              <Flex>
                <FlexItem align={{ default: "alignRight" }}>
                  <Switch
                    id="iot-cert-edit-json-switch"
                    aria-label="Switch for edit in Json"
                    label="Edit in Json"
                    isChecked={isJsonView}
                    onChange={handleJsonViewChange}
                  />
                  <br />
                </FlexItem>
              </Flex>
            ) : (
              <IoTCertificateToolbar
                handleJsonViewChange={handleJsonViewChange}
                isJsonView={isJsonView}
                setShowCertificateForm={setShowCertificateForm}
              />
            )}
          </PageSection>
          {showCertificateForm && (
            <PageSection className={css(style.no_bottom_padding)}>
              <CertificateForm
                id="iot-cert-list-add-certificate-form"
                setOnEditMode={setShowCertificateForm}
                onSave={onCreate}
              />
              <br />
            </PageSection>
          )}
          {isJsonView ? (
            <Grid>
              <GridItem span={12}>
                <JsonEditor
                  value={
                    certificates && JSON.stringify(certificates, undefined, 2)
                  }
                />
              </GridItem>
            </Grid>
          ) : (
            certificates.map((certificate: IIoTCertificate, index: number) => (
              <IoTCertificate
                key={`certificate-${index}`}
                id={`certificate-${index}`}
                certificate={certificate}
                onEdit={onSave}
                onChangeStatus={onChangeStatus}
                onDelete={onDelete}
              />
            ))
          )}
        </GridItem>
      </Grid>
    </PageSection>
  );
};
