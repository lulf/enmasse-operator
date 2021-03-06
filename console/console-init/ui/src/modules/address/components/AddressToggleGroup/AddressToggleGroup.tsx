/*
 * Copyright 2020, EnMasse authors.
 * License: Apache License 2.0 (see the file LICENSE or http://apache.org/licenses/LICENSE-2.0.html).
 */

import React from "react";
import {
  SelectOptionObject,
  ToolbarToggleGroup,
  ToolbarGroup,
  ToolbarFilter,
  InputGroup,
  Button,
  ToolbarItem,
  ButtonVariant,
  DropdownPosition,
  Badge,
  ToolbarChipGroup,
  ToolbarChip
} from "@patternfly/react-core";
import { ISelectOption } from "utils";
import { FilterIcon, SearchIcon } from "@patternfly/react-icons";
import { TypeAheadSelect, DropdownWithToggle } from "components";

export interface IAddressToggleGroupProps {
  totalRecords: number;
  filterSelected?: string;
  nameSelected?: string;
  nameInput?: string;
  typeSelected?: string | null;
  statusSelected?: string | null;
  selectedNames: Array<{ value: string; isExact: boolean }>;
  onFilterSelect: (value: string) => void;
  onNameSelect: (e: any, selection: SelectOptionObject) => void;
  onNameClear: () => void;
  onTypeSelect: (selection: string) => void;
  onStatusSelect: (selection: string) => void;
  onSearch: () => void;
  onDelete: (
    category: string | ToolbarChipGroup,
    chip: string | ToolbarChip
  ) => void;
  onChangeNameInput?: (value: string) => Promise<any>;
  setNameInput?: (value: string) => void;
}

const AddressToggleGroup: React.FunctionComponent<IAddressToggleGroupProps> = ({
  totalRecords,
  filterSelected,
  nameSelected,
  nameInput,
  typeSelected,
  statusSelected,
  selectedNames,
  onFilterSelect,
  onNameSelect,
  onNameClear,
  onTypeSelect,
  onStatusSelect,
  onSearch,
  onDelete,
  onChangeNameInput,
  setNameInput
}) => {
  const filterMenuItems = [
    { key: "name", value: "Name" },
    { key: "type", value: "Type" },
    { key: "status", value: "Status" }
  ];
  const typeOptions: ISelectOption[] = [
    { key: "anycast", value: "Anycast", isDisabled: false },
    { key: "multicast", value: "Multicast", isDisabled: false },
    { key: "queue", value: "Queue", isDisabled: false },
    { key: "subscription", value: "Subscription", isDisabled: false },
    { key: "topic", value: "Topic", isDisabled: false }
  ];

  const statusOptions: ISelectOption[] = [
    { key: "active", value: "Active", isDisabled: false },
    { key: "configuring", value: "Configuring", isDisabled: false },
    { key: "pending", value: "Pending", isDisabled: false },
    { key: "failed", value: "Failed", isDisabled: false },
    { key: "terminating", value: "Terminating", isDisabled: false }
  ];

  const checkIsFilterApplied = () => {
    if (
      (selectedNames && selectedNames.length > 0) ||
      (typeSelected && typeSelected.trim() !== "") ||
      (statusSelected && statusSelected.trim() !== "")
    ) {
      return true;
    }
    return false;
  };

  const toggleItems = (
    <>
      <ToolbarItem
        spacer={{ md: "spacerNone" }}
        data-codemods="true"
        id="addr-list-toolbar-item-addressname"
      >
        <ToolbarFilter
          id="addr-list-toolbar-filter-addressname"
          chips={selectedNames.map(filter => filter.value)}
          deleteChip={onDelete}
          categoryName="Name"
        >
          {filterSelected && filterSelected.toLowerCase() === "name" && (
            <InputGroup>
              <TypeAheadSelect
                id="addr-list-filter-addname-typeahead-input"
                typeAheadAriaLabel={"Select name"}
                aria-LabelledBy={"typeahead-select-id"}
                onSelect={onNameSelect}
                onClear={onNameClear}
                selected={nameSelected}
                inputData={nameInput || ""}
                placeholderText={"Select name"}
                onChangeInput={onChangeNameInput}
                setInput={setNameInput}
              />
              <Button
                id="addr-togglegrp-search-name-button"
                variant={ButtonVariant.control}
                aria-label="search button for search name"
                onClick={onSearch}
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          )}
        </ToolbarFilter>
      </ToolbarItem>
      <ToolbarItem
        spacer={{ md: "spacerNone" }}
        data-codemods="true"
        id="addr-togglegrp-toolbar-item-addresstype"
      >
        <ToolbarFilter
          chips={typeSelected ? [typeSelected] : []}
          deleteChip={onDelete}
          categoryName="Type"
          id="addr-togglegrp-type-toolbar-filter"
        >
          {filterSelected && filterSelected.toLowerCase() === "type" && (
            <DropdownWithToggle
              id="addr-togglegrp-addresstype-dropdown"
              toggleId="addr-togglegrp-addresstype-dropdowntoggle"
              aria-label="select type from dropdown"
              dropdownItemIdPrefix="al-filter-select-type-dropdown-item"
              position={DropdownPosition.left}
              onSelectItem={onTypeSelect}
              dropdownItems={typeOptions}
              value={typeSelected || "Select Type"}
            />
          )}
        </ToolbarFilter>
      </ToolbarItem>
      <ToolbarItem
        spacer={{ md: "spacerNone" }}
        data-codemods="true"
        id="addr-togglegrp-status-toolbar-item"
      >
        <ToolbarFilter
          chips={statusSelected ? [statusSelected] : []}
          deleteChip={onDelete}
          categoryName="Status"
          id="addr-togglegrp-type-toolbar-filter"
        >
          {filterSelected && filterSelected.toLowerCase() === "status" && (
            <DropdownWithToggle
              id="addr-togglegrp-select-status-dropdown"
              toggleId="addr-togglegrp-select-status-dropdowntoggle"
              aria-label="select status from dropdown"
              dropdownItemIdPrefix="al-filter-select-status-dropdown-item"
              position={DropdownPosition.left}
              onSelectItem={onStatusSelect}
              dropdownItems={statusOptions}
              value={statusSelected || "Select Status"}
            />
          )}
        </ToolbarFilter>
      </ToolbarItem>
    </>
  );

  const toggleGroupItems = (
    <ToolbarGroup
      variant="filter-group"
      data-codemods="true"
      id="addr-togglegrp-filter-toolbar-group"
    >
      <ToolbarFilter categoryName="Filter" id="addr-toggle-toolbar-filter">
        <DropdownWithToggle
          id="addr-togglegrp-filter-dropdown"
          aria-label="select filter from dropdown"
          toggleId={"addr-togglegrp-filter-dropdowntoggle"}
          dropdownItemIdPrefix="al-filter-dropdown"
          position={DropdownPosition.left}
          onSelectItem={onFilterSelect}
          dropdownItems={filterMenuItems}
          value={(filterSelected && filterSelected.trim()) || "Filter"}
          toggleIcon={
            <>
              <FilterIcon />
              &nbsp;
            </>
          }
        />
        {toggleItems}
      </ToolbarFilter>
    </ToolbarGroup>
  );

  return (
    <ToolbarToggleGroup
      id="adr-togglegrp-filter-applied-toolbartogglegroup"
      toggleIcon={
        <>
          <FilterIcon />
          {checkIsFilterApplied() && (
            <Badge id="adr-toggle-filter-applied-badge" key={1} isRead>
              {totalRecords}
            </Badge>
          )}
        </>
      }
      breakpoint="xl"
    >
      {toggleGroupItems}
    </ToolbarToggleGroup>
  );
};
export { AddressToggleGroup };
