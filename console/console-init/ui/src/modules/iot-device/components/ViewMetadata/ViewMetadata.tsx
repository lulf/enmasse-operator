/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import { convertJsonToMetadataOptions } from "utils";
import { StyleSheet, css } from "aphrodite";
import { MetadataReviewRows } from "./MetadataReviewRows";

const styles = StyleSheet.create({
  text_center_align: { textAlign: "center" }
});
interface IViewMetadataProps {
  defaults?: any[];
  ext?: any[];
}
const ViewMetadata: React.FunctionComponent<IViewMetadataProps> = ({
  defaults,
  ext
}) => {
  if (ext === undefined && defaults === undefined) {
    return <>--</>;
  }
  const convertedDefaultsData = defaults
    ? convertJsonToMetadataOptions(defaults)
    : [];
  const convertedExtData = ext ? convertJsonToMetadataOptions(ext) : [];
  if (convertedDefaultsData.length === 0 && convertedExtData.length === 0) {
    return <>--</>;
  }
  const renderGrid = (metadataRows: any[], label: string) => {
    return (
      <>
        <Grid>
          <GridItem span={1}></GridItem>
          <GridItem span={3} className={css(styles.text_center_align)}>
            <b>{label}</b>
          </GridItem>
          <GridItem span={3} className={css(styles.text_center_align)}>
            <b>Type</b>
          </GridItem>
          <GridItem span={3} className={css(styles.text_center_align)}>
            <b>Value</b>
          </GridItem>
        </Grid>
        <MetadataReviewRows metadataRows={metadataRows} />
      </>
    );
  };
  return (
    <>
      {convertedDefaultsData.length > 0 &&
        renderGrid(convertedDefaultsData, "Default properties parameter")}
      <br />
      {convertedExtData.length > 0 &&
        renderGrid(convertedExtData, "Extension parameter")}
    </>
  );
};

export { ViewMetadata };
